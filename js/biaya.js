const TUITION_STORAGE_KEY = 'nk_semester_5_payments';

function getPayments() {
  try {
    const savedPayments = JSON.parse(localStorage.getItem(TUITION_STORAGE_KEY) || '[]');
    return Array.isArray(savedPayments) ? savedPayments : [];
  } catch {
    return [];
  }
}

function savePayments(payments) {
  localStorage.setItem(TUITION_STORAGE_KEY, JSON.stringify(payments));
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

function formatPaymentDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function renderPayments() {
  const payments = getPayments().sort((first, second) => second.date.localeCompare(first.date));
  const paymentList = document.getElementById('paymentList');
  const totalTuition = document.getElementById('totalTuition');
  const paymentCount = document.getElementById('paymentCount');

  if (!paymentList || !totalTuition || !paymentCount) {
    return;
  }

  const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  totalTuition.textContent = formatRupiah(total);
  paymentCount.textContent = `${payments.length} pembayaran`;

  paymentList.innerHTML = payments.length
    ? payments.map(payment => `
      <article class="payment-item">
        <div class="payment-item-info">
          <strong>${escapeHtml(payment.description)}</strong>
          <span>${formatPaymentDate(payment.date)}</span>
        </div>
        <strong class="payment-amount">${formatRupiah(payment.amount)}</strong>
        <div class="payment-actions">
          <button class="payment-action" type="button" data-edit-payment="${payment.id}">Edit</button>
          <button class="payment-action payment-action-danger" type="button" data-delete-payment="${payment.id}">Hapus</button>
        </div>
      </article>
    `).join('')
    : '<p class="no-class">Belum ada catatan pembayaran.</p>';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

function resetPaymentForm() {
  const form = document.getElementById('paymentForm');
  const paymentId = document.getElementById('paymentId');
  const formTitle = document.getElementById('tuitionFormTitle');
  const submitButton = document.getElementById('paymentSubmit');
  const cancelButton = document.getElementById('paymentCancel');

  form.reset();
  paymentId.value = '';
  formTitle.textContent = 'Tambah Pembayaran';
  submitButton.textContent = 'Simpan Pembayaran';
  cancelButton.hidden = true;
}

function showPaymentMessage(message, type = 'success') {
  const messageElement = document.getElementById('paymentMessage');
  messageElement.textContent = message;
  messageElement.className = `form-message form-message-${type}`;
  window.setTimeout(() => {
    messageElement.textContent = '';
    messageElement.className = 'form-message';
  }, 3000);
}

function editPayment(id) {
  const payment = getPayments().find(item => item.id === id);
  if (!payment) {
    return;
  }

  document.getElementById('paymentId').value = payment.id;
  document.getElementById('paymentDescription').value = payment.description;
  document.getElementById('paymentAmount').value = payment.amount;
  document.getElementById('paymentDate').value = payment.date;
  document.getElementById('tuitionFormTitle').textContent = 'Edit Pembayaran';
  document.getElementById('paymentSubmit').textContent = 'Perbarui Pembayaran';
  document.getElementById('paymentCancel').hidden = false;
  document.getElementById('paymentDescription').focus();
}

function deletePayment(id) {
  const payment = getPayments().find(item => item.id === id);
  if (!payment || !window.confirm(`Hapus catatan pembayaran "${payment.description}"?`)) {
    return;
  }

  savePayments(getPayments().filter(item => item.id !== id));
  renderPayments();
  showPaymentMessage('Pembayaran berhasil dihapus.');
}

function initTuitionPage() {
  const form = document.getElementById('paymentForm');
  const paymentList = document.getElementById('paymentList');
  const cancelButton = document.getElementById('paymentCancel');

  if (!form || !paymentList) {
    return;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    const paymentId = formData.get('id') || document.getElementById('paymentId').value;
    const payment = {
      id: paymentId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      description: String(formData.get('description')).trim(),
      amount: Number(formData.get('amount')),
      date: formData.get('date')
    };
    const payments = getPayments();
    const existingIndex = payments.findIndex(item => item.id === payment.id);

    if (existingIndex >= 0) {
      payments[existingIndex] = payment;
      showPaymentMessage('Pembayaran berhasil diperbarui.');
    } else {
      payments.push(payment);
      showPaymentMessage('Pembayaran berhasil disimpan.');
    }

    savePayments(payments);
    renderPayments();
    resetPaymentForm();
  });

  cancelButton.addEventListener('click', resetPaymentForm);
  paymentList.addEventListener('click', event => {
    const editButton = event.target.closest('[data-edit-payment]');
    const deleteButton = event.target.closest('[data-delete-payment]');

    if (editButton) {
      editPayment(editButton.dataset.editPayment);
    }

    if (deleteButton) {
      deletePayment(deleteButton.dataset.deletePayment);
    }
  });

  renderPayments();
}
