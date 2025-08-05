import mysql from 'mysql2';

export default class DBConnection {
    constructor() {
        this.db_conn = mysql.createConnection({
            host:     process.env.DB_HOST,
            user:     process.env.DB_USER,
            password: process.env.DB_KEY,
            port:     process.env.DB_PORT,
            database: process.env.DB_BASE
        });

        this.db_conn.connect((err) => {
            if (err)
                console.error('Erro ao conectar:', err);
            else
                console.log('Conectado ao banco de dados');
        });
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db_conn.connect((err) => {
                if (err) {
                    console.error('Erro ao conectar ao banco:', err);
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    getConnection() {
        return this.db_conn;
    }

    #query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db_conn.query(sql, params, (err, results) => {
                if (err) {
                    console.error('Erro na consulta:', err);
                    return reject(err);
                }

                console.log('Consulta executada com sucesso:', sql, params);
                console.log('Resultados:', results);

                return resolve(results);
            });
        });
    }        

    async execute({ operação, table, data = {}, filters = [], options = {} }) {
        let sql = '';
        const params = [];

        if (!/^[a-zA-Z0-9_]+$/.test(table)) {
            throw new Error('Nome da tabela inválido');
        }

        const buildWhere = () => {
            if (!filters.length) return '';

            const clauses = filters.map((filter, i) => {
                const { field, operator, value, boolean } = filter;
                const op = ['=', '>', '<', '>=', '<=', '<>', '!=', 'LIKE', 'IN'].includes(operator?.toUpperCase()) ? operator.toUpperCase() : '=';
                const bool = i === 0 ? '' : (boolean && ['AND', 'OR'].includes(boolean.toUpperCase()) ? ` ${boolean.toUpperCase()} ` : ' AND ');

                if (op === 'IN' && Array.isArray(value)) {
                const placeholders = value.map(() => '?').join(', ');
                params.push(...value);
                return `${bool}\`${field}\` IN (${placeholders})`;
                } else {
                params.push(value);
                return `${bool}\`${field}\` ${op} ?`;
                }
            });

            return ' WHERE ' + clauses.join('');
        };

        switch (operação.toLowerCase()) {
            case 'select': {
                sql = `SELECT ${options.columns?.join(', ') || '*'} FROM \`${table}\``;
                sql += buildWhere();

                if (options.orderBy) {
                    const dir = ['ASC', 'DESC'].includes(options.orderBy.direction?.toUpperCase()) ? options.orderBy.direction.toUpperCase() : 'ASC';
                    sql += ` ORDER BY \`${options.orderBy.column}\` ${dir}`;
                }

                if (options.limit) 
                    sql += ` LIMIT ${parseInt(options.limit)}`;                
                break;
            }
            case 'insert': {
                const keys = Object.keys(data);
                if (keys.length === 0) throw new Error('Dados para INSERT vazios');

                const placeholders = keys.map(() => '?').join(', ');
                sql = `INSERT INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
                params.push(...keys.map(k => data[k]));
                break;
            }
            case 'update': {
                const keys = Object.keys(data);
                if (keys.length === 0) throw new Error('Dados para UPDATE vazios');

                sql = `UPDATE \`${table}\` SET `;
                sql += keys.map(k => `\`${k}\` = ?`).join(', ');
                params.push(...keys.map(k => data[k]));
                sql += buildWhere();
                break;
            }
            case 'delete': {
                sql = `DELETE FROM \`${table}\``;
                sql += buildWhere();
                break;
            }
            default:
                throw new Error('Operação inválida');
        }

        return await this.#query(sql, params);
    }
}
