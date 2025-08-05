window.addEventListener("DOMContentLoaded", () => {
    setProductsGrid();
});

function setProductsGrid(){
    const mainContainer = document.querySelector(".ProductsContainer");

    const formatedCard = (item) => {
        console.log(item);

        return `<div class='itemCard' id='${item.Recid}'>
            <h3>${item.itemId}</h3>
            <p>${item.ItemDescription}</p>
        </div>`;
    };

    fetch('http://devutils.dev.br:3000/itens?limit=4')
    .then(response => response.json())  
    .then(items => {   
        mainContainer.innerHTML = ''; 
        
        items.results.forEach(item => {     
            const row = document.createElement('div');
            row.innerHTML = formatedCard(item);   
                            
            mainContainer.appendChild(row);

            row.addEventListener('click', () => {
                alert(`Item ${item.itemId} clicado!`);
            })
        });
    })
    .catch(err => {
        console.error('Erro ao carregar os itens:', err);
    });

}