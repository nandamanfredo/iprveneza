/* IPR Volts / IPR Veneza - Interactive Application Logic */

// Global State Variables
let currentStep = 1;
let recoveryTarget = "";
let resendTimerInterval = null;
let resendSeconds = 30;

// Tab Switcher Logic
function switchTab(tabName) {
  const secLogin = document.getElementById('secLogin');
  const secRegister = document.getElementById('secRegister');
  const secRecovery = document.getElementById('secRecovery');
  const navTabs = document.getElementById('navTabs');
  const dashboardView = document.getElementById('dashboardView');

  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const tabRecovery = document.getElementById('tabRecovery');

  // Hide dashboard if visible
  if (dashboardView) dashboardView.style.display = 'none';
  if (navTabs) navTabs.style.display = 'flex';

  // Deactivate all tabs & sections
  [tabLogin, tabRegister, tabRecovery].forEach(tab => {
    if (tab) {
      tab.classList.remove('active', 'active-recovery');
    }
  });

  [secLogin, secRegister, secRecovery].forEach(sec => {
    if (sec) sec.classList.remove('active');
  });

  if (tabName === 'login') {
    tabLogin.classList.add('active');
    secLogin.classList.add('active');
  } else if (tabName === 'register') {
    tabRegister.classList.add('active');
    secRegister.classList.add('active');
  } else if (tabName === 'recovery') {
    tabRecovery.classList.add('active-recovery');
    secRecovery.classList.add('active');
    goToStep(1); // Reset recovery to Step 1 when opened
  }

  // Refresh Lucide icons
  if (window.lucide) window.lucide.createIcons();
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, buttonEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    buttonEl.innerHTML = '<i data-lucide="eye-off"></i>';
  } else {
    input.type = 'password';
    buttonEl.innerHTML = '<i data-lucide="eye"></i>';
  }

  if (window.lucide) window.lucide.createIcons();
}

// =========================================================
// FORGOT PASSWORD (ESQUECI A SENHA) RECOVERY FLOW
// =========================================================

// Move focus to next OTP input box
function moveOtpFocus(currentInput, index) {
  if (currentInput.value.length === 1 && index < 6) {
    const nextInput = document.getElementById(`otp${index + 1}`);
    if (nextInput) nextInput.focus();
  }
}

// Go to specific step in recovery flow
function goToStep(stepNumber) {
  currentStep = stepNumber;

  // Update step indicators
  for (let i = 1; i <= 4; i++) {
    const indicator = document.getElementById(`stepIndicator${i}`);
    const stepBox = document.getElementById(`recStep${i}`);

    if (indicator) {
      indicator.classList.remove('active', 'completed');
      if (i < stepNumber) indicator.classList.add('completed');
      if (i === stepNumber) indicator.classList.add('active');
    }

    if (stepBox) {
      stepBox.style.display = i === stepNumber ? 'block' : 'none';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// Step 1: Send Identification Code
function handleRecoveryStep1(e) {
  e.preventDefault();
  const emailInput = document.getElementById('recEmail');
  if (!emailInput || !emailInput.value.trim()) {
    showToast('Por favor, informe seu e-mail ou WhatsApp.', 'error');
    return;
  }

  recoveryTarget = emailInput.value.trim();
  document.getElementById('sentTargetDisplay').innerText = recoveryTarget;

  showToast(`Código de segurança enviado para ${recoveryTarget}!`, 'success');
  goToStep(2);
  startResendTimer();
}

// Countdown timer for re-sending OTP
function startResendTimer() {
  clearInterval(resendTimerInterval);
  resendSeconds = 30;
  const timerSpan = document.getElementById('resendTimer');
  const btnResend = document.getElementById('btnResendOtp');

  if (btnResend) btnResend.disabled = true;

  resendTimerInterval = setInterval(() => {
    resendSeconds--;
    if (timerSpan) timerSpan.innerText = resendSeconds;

    if (resendSeconds <= 0) {
      clearInterval(resendTimerInterval);
      if (btnResend) btnResend.disabled = false;
      if (timerSpan) timerSpan.innerText = '0';
    }
  }, 1000);
}

// Re-send OTP Code
function resendOtpCode() {
  if (resendSeconds > 0) return;
  showToast(`Novo código de 6 dígitos enviado para ${recoveryTarget}!`, 'success');
  startResendTimer();
}

// Step 2: Validate OTP Code
function handleRecoveryStep2(e) {
  e.preventDefault();
  let code = "";
  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById(`otp${i}`);
    if (box) code += box.value;
  }

  if (code.length < 6) {
    showToast('Por favor, preencha o código completo de 6 dígitos.', 'error');
    return;
  }

  showToast('Código verificado com sucesso!', 'success');
  goToStep(3);
}

// Check password strength on input
function checkPasswordStrength(val) {
  const bar = document.getElementById('strengthBar');
  const text = document.getElementById('strengthText');

  if (!bar || !text) return;

  bar.className = 'strength-bar';

  if (!val) {
    text.innerText = 'Força da senha';
    return;
  }

  if (val.length < 6) {
    bar.classList.add('strength-weak');
    text.innerText = 'Senha Fraca (mínimo 6 caracteres)';
    text.style.color = 'var(--danger)';
  } else if (val.length >= 6 && (/[A-Z]/.test(val) || /[0-9]/.test(val))) {
    bar.classList.add('strength-strong');
    text.innerText = 'Senha Forte ✓';
    text.style.color = 'var(--accent)';
  } else {
    bar.classList.add('strength-medium');
    text.innerText = 'Senha Média (adicione números ou maiúsculas)';
    text.style.color = 'var(--warning)';
  }
}

// Step 3: Reset Password
function handleRecoveryStep3(e) {
  e.preventDefault();
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;

  if (newPass.length < 6) {
    showToast('A senha precisa ter no mínimo 6 caracteres.', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    showToast('As senhas não coincidem. Verifique e tente novamente.', 'error');
    return;
  }

  showToast('Senha alterada com sucesso!', 'success');
  goToStep(4);
}

// =========================================================
// LOGIN & REGISTRATION & DASHBOARD LOGIC
// =========================================================

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;

  showToast('Autenticando no IPR Volts...', 'success');

  setTimeout(() => {
    // Hide forms and show Dashboard view
    document.getElementById('secLogin').classList.remove('active');
    document.getElementById('navTabs').style.display = 'none';
    
    const dash = document.getElementById('dashboardView');
    if (dash) {
      dash.style.display = 'block';
      document.getElementById('dashUserName').innerText = email.split('@')[0] || 'Voluntário IPR';
      document.getElementById('dashAvatar').innerText = (email[0] || 'V').toUpperCase();
    }
    showToast('Bem-vindo(a) de volta ao IPR Volts!', 'success');
  }, 800);
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const dept = document.getElementById('regDepartment').value;

  showToast(`Cadastro de ${name} realizado no ministério ${dept}!`, 'success');
  setTimeout(() => switchTab('login'), 1200);
}

function handleLogout() {
  showToast('Sua sessão foi encerrada com segurança.', 'warning');
  setTimeout(() => switchTab('login'), 800);
}

// Toast Notifications Function
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast) return;

  toast.className = `toast toast-${type}`;
  toastMsg.innerText = message;

  if (type === 'success') toastIcon.setAttribute('data-lucide', 'check-circle');
  else if (type === 'error') toastIcon.setAttribute('data-lucide', 'alert-triangle');
  else if (type === 'warning') toastIcon.setAttribute('data-lucide', 'bell');
  else toastIcon.setAttribute('data-lucide', 'info');

  if (window.lucide) window.lucide.createIcons();

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
});
