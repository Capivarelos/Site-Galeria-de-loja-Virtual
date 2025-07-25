// Importante: certifique-se de que ui-utils.js está incluído no HTML antes deste script!
// Funções para abrir/fechar sidebar e galeria de imagens usando UIUtils
function w3_open() {
    window.UIUtils.openSidebar();
}

function w3_close() {
    window.UIUtils.closeSidebar();
}

function onClick(element) {
    window.UIUtils.openImageModal(element);
}
