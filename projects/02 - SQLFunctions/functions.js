window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fetchItems").addEventListener("click", consultItens);
    document.getElementById("fetchVerification").addEventListener("click", checkvalue);
});

function consultItens(){
    fetch('http://devutils.dev.br:3000/query?table=itens')
    .then(response => response.json())  
    .then(items => {                   
        items.results.forEach(item => {     
            console.log(item);
        });
    })
    .catch(err => {
        //Roda local se der erro no Dominio
        fetch('http://localhost:3000/query?table=itens')
        .then(response => response.json())  
        .then(items => {   
            items.results.forEach(item => {     
                console.log(item);
            });
        })
    });
}

function checkvalue(){    
    const ref_id = '001';
    fetch(`http://devutils.dev.br:3000/statecheck?ref_id=${ref_id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.results && data.results.length > 0) {
            console.log('Estado da verificação:', data.results[0].ref_state);
        } else {
            console.log('Nenhum resultado encontrado.');
        }
    })
    .catch(err => {
        if(err)
            console.error('Erro ao consultar o estado:', err);
        else {
            fetch(`http://localhost:3000/statecheck?ref_id=${ref_id}`)
            .then(response => response.json())  
            .then(items => {   
                items.results.forEach(item => {     
                    console.log(item);
                });
            })
            .catch(err => {
                if(err)
                    console.error('Erro ao consultar o estado:', err);
            });
        }
    });
}

