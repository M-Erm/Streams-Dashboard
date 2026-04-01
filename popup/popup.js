// ===========================================
// Quando informação for alterada no popup, salva a informação do DB da API Chrome.Storage (local)
// ===========================================

const checkboxes = document.querySelectorAll('input[type=checkbox]')

checkboxes.forEach(element => {

  element.addEventListener("change", async () => {

    await chrome.storage.local.set({ 
      [element.id]: element.checked, }, () => {
        console.log(`${element.id} mudou para ${element.checked}`);
    });

  });
  
});

document.addEventListener("DOMContentLoaded", async () => {
  const result = await chrome.storage.local.get(null);

  checkboxes.forEach(element => {
    element.checked = result[element.id] ?? false;
  });

});