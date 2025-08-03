let items = [];

function addItem() {
  const itemId = items.length;
  const itemDiv = document.createElement('div');
  itemDiv.className = 'invoice-item';
  itemDiv.innerHTML = `
    <input type="text" placeholder="Description" onchange="updateItem(${itemId}, 'desc', this.value)" />
    <input type="number" placeholder="Qty" onchange="updateItem(${itemId}, 'qty', this.value)" />
    <input type="number" placeholder="Unit Price" onchange="updateItem(${itemId}, 'price', this.value)" />
    <input type="number" placeholder="Tax (%)" onchange="updateItem(${itemId}, 'tax', this.value)" />
    <input type="number" placeholder="Shipping ($)" onchange="updateItem(${itemId}, 'shipping', this.value)" />
  `;
  document.getElementById('items').appendChild(itemDiv);
  items.push({ desc: '', qty: 0, price: 0, tax: 0, shipping: 0 });
}

function updateItem(index, field, value) {
  items[index][field] = field === 'desc' ? value : parseFloat(value) || 0;
}

function generateInvoiceWithLogo() {
  const contactEmail = document.getElementById('contactEmail').value;
  const company = document.getElementById('company').value;
  const client = document.getElementById('client').value;
  const email = document.getElementById('email').value;
  const notes = document.getElementById('notes').value;
  const invoiceNumber = document.getElementById('invoiceNumber').value || '#00001';
  const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];

  const logoFile = document.getElementById('logoUpload').files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const logoURL = e.target.result;

    const total = items.reduce((sum, item) => {
      const base = item.qty * item.price;
      const taxAmount = base * (item.tax / 100);
      const shipping = item.shipping;
      return sum + base + taxAmount + shipping;
    }, 0).toFixed(2);

    const itemsHTML = items.map(item => {
      const base = item.qty * item.price;
      const taxAmount = base * (item.tax / 100);
      const totalItem = base + taxAmount + item.shipping;

      return `
        <tr>
          <td>${item.desc}</td>
          <td>${item.qty}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.tax}%</td>
          <td>$${item.shipping.toFixed(2)}</td>
          <td>$${totalItem.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const invoicePreview = document.getElementById('invoice-preview');
    invoicePreview.innerHTML = `
      <div class="invoice-header">
        ${logoURL ? `<img src="${logoURL}" alt="Logo" style="max-width: 120px; margin-bottom: 10px;" />` : ''}
        <h2>${company}</h2>
        <p><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${invoiceDate}</p>
        <p><strong>Client:</strong> ${client}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      <table id="invoiceTable">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Tax (%)</th>
            <th>Shipping</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <p class="invoice-total"><strong>Total:</strong> $${total}</p>
      <p><em>${notes}</em></p>
      <hr />
      <p style="font-size: 0.9em; text-align: center; margin-top: 20px;">
        For questions regarding this invoice, contact us at: 
        <a href="mailto:${contactEmail}">${contactEmail}</a>
      </p>
    `;

    document.getElementById('preview-section').style.display = 'block';
  };

  if (logoFile) {
    reader.readAsDataURL(logoFile);
  } else {
    reader.onload({ target: { result: '' } });
  }
}

function downloadInvoice() {
  const { jsPDF } = window.jspdf; // ✅ Access jsPDF from global scope
  const element = document.getElementById("invoice-preview");

  document.getElementById('preview-section').style.display = 'block';

  const logoImg = element.querySelector('img');
  const renderPDF = () => {
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;

      let position = 0;

      if (imgHeight > pageHeight) {
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          remainingHeight -= pageHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
            position = 0;
          }
        }
      } else {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      }

      pdf.save('invoice.pdf'); // ✅ Trigger download
    });
  };

  if (logoImg && !logoImg.complete) {
    logoImg.onload = renderPDF;
  } else {
    renderPDF();
  }
}




function generateAndDownloadInvoice() {
  generateInvoiceWithLogo();

  setTimeout(() => {
    downloadInvoice();
  }, 500); // Wait for DOM to render
}

function clearInvoice() {
  document.getElementById('invoiceNumber').value = '';
  document.getElementById('invoiceDate').value = '';
  document.getElementById('company').value = '';
  document.getElementById('client').value = '';
  document.getElementById('email').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('items').innerHTML = '';
  document.getElementById('logoPreview').src = '';
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('invoice-preview').innerHTML = '';
  items = [];
}

function toggleTheme() {
  const isDark = document.getElementById('themeSwitch').checked;
  document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

