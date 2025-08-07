window.addEventListener("DOMContentLoaded", () => {
    setCurrentMenu();
});

function menuSwitch(event){
    clearbuttons();
    const button = document.getElementById(event.target.id);
    button.classList.add('active');
    setCurrentMenu();
}

function setCurrentMenu() {
    const activeButton = document.querySelector('.menu_Button.active');
    if (activeButton) {
        const menuTitle = document.getElementById('menu_title');
        menuTitle.textContent = `parametros - ${activeButton.textContent.toLowerCase()}`;
    }
}

function clearbuttons(){
    const buttons = document.querySelectorAll('.menu_Button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
}