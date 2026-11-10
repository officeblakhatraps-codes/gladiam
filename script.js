const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuButton.textContent = isOpen ? "×" : "☰";
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) {
      menuButton.textContent = '☰';
      menuButton.setAttribute('aria-label', 'Open navigation');
    }
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const catalogue = {
  "DTF Printing": [
    {name:"Pocket size", price:40},
    {name:"A5 size", price:60},
    {name:"A4 size", price:90},
    {name:"A3 size", price:120},
    {name:"A3 + pocket size", price:150}
  ],
  "Printing Services": [
    {name:"Cup stickers (MOQ 50)", price:5, min:50},
    {name:"Car stickers (MOQ 9)", price:50, min:9},
    {name:"Ticket designs (MOQ 50)", price:6, min:50},
    {name:"Business cards (MOQ 50)", price:6, min:50}
  ],
  "Combo Services": [
    {name:"Oversized tee + A3 & pocket", price:350},
    {name:"Normal tee + A3 & pocket", price:250},
    {name:"Normal tee + A4 print", price:160},
    {name:"Cap or hat + print", price:80}
  ],
  "Business Design": [
    {name:"Logo design", price:250},
    {name:"Business poster", price:200},
    {name:"Letterhead", price:150},
    {name:"Business card design", price:100}
  ]
};

const serviceSelect = document.getElementById("serviceSelect");
const itemSelect = document.getElementById("itemSelect");
const quantityInput = document.getElementById("quantity");
const estimate = document.getElementById("estimate");
const estimateNote = document.getElementById("estimateNote");

function updateItems() {
  const items = catalogue[serviceSelect.value] || [];
  itemSelect.innerHTML = '<option value="">Select item</option>';
  items.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${item.name} — R${item.price.toFixed(2)} each`;
    itemSelect.appendChild(option);
  });
  updateEstimate();
}

function updateEstimate() {
  const items = catalogue[serviceSelect.value] || [];
  const selected = items[Number(itemSelect.value)];
  const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
  if (!selected || itemSelect.value === "") {
    estimate.textContent = "To be confirmed";
    estimateNote.textContent = "Select a priced item to calculate an estimate.";
    return;
  }
  const total = selected.price * quantity;
  estimate.textContent = `R${total.toLocaleString("en-ZA", {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  estimateNote.textContent = selected.min
    ? `Based on R${selected.price} each. Minimum order quantity: ${selected.min}. ${quantity < selected.min ? "Your quantity is below the minimum; please adjust it." : "Final price to be confirmed by Gladiam."}`
    : `Based on R${selected.price} each. Final price to be confirmed by Gladiam.`;
}

serviceSelect.addEventListener("change", updateItems);
itemSelect.addEventListener("change", updateEstimate);
quantityInput.addEventListener("input", updateEstimate);

document.querySelectorAll("[data-service]").forEach(link => {
  link.addEventListener("click", () => {
    const service = link.dataset.service;
    const match = [...serviceSelect.options].find(option => option.text === service || option.value === service);
    if (match) {
      serviceSelect.value = match.value;
      updateItems();
    }
  });
});

// Submit via fetch for a smoother experience; PHP still performs server-side validation.
const quoteForm = document.getElementById("quoteForm");
const formStatus = document.getElementById("formStatus");
quoteForm.addEventListener("submit", async event => {
  event.preventDefault();
  formStatus.textContent = "Sending your enquiry...";
  const submitButton = quoteForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    const response = await fetch(quoteForm.action, {
      method: "POST",
      body: new FormData(quoteForm),
      headers: {"Accept":"application/json"}
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Your enquiry could not be sent.");
    formStatus.textContent = result.message || "Thank you. Your enquiry has been sent.";
    quoteForm.reset();
    itemSelect.innerHTML = '<option value="">Select item</option>';
    estimate.textContent = "To be confirmed";
    estimateNote.textContent = "Select a priced item to calculate an estimate.";
  } catch (error) {
    formStatus.textContent = `${error.message} You can also contact Gladiam on WhatsApp: 075 324 5817.`;
  } finally {
    submitButton.disabled = false;
  }
});
