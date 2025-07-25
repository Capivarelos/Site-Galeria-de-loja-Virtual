// Utilitários para UI - Sidebar e Galeria de Imagens
// Função para abrir a barra lateral
function openSidebar(sidebarId = "mySidebar", overlayId = "myOverlay") {
    const sidebar = document.getElementById(sidebarId);
    const overlay = document.getElementById(overlayId);
    if (sidebar) sidebar.style.display = "block";
    if (overlay) overlay.style.display = "block";
}

// Função para fechar a barra lateral
function closeSidebar(sidebarId = "mySidebar", overlayId = "myOverlay") {
    const sidebar = document.getElementById(sidebarId);
    const overlay = document.getElementById(overlayId);
    if (sidebar) sidebar.style.display = "none";
    if (overlay) overlay.style.display = "none";
}

// Função para abrir modal de galeria de imagem
function openImageModal(element, imgId = "img01", modalId = "modal01", captionId = "caption") {
    const img = document.getElementById(imgId);
    const modal = document.getElementById(modalId);
    const caption = document.getElementById(captionId);
    if (img && modal) {
        img.src = element.src;
        modal.style.display = "block";
        if (caption) caption.innerHTML = element.alt || "";
    }
}

// Exportando funções para uso global
window.UIUtils = {
    openSidebar,
    closeSidebar,
    openImageModal
}; 