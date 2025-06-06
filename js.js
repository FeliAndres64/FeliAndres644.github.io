(() => {
  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2
  });
  const showToast = (t, bg = '#28a745') =>
    Toastify({ text: t, duration: 3000, style: { background: bg } }).showToast();
  const genId = arr => arr.length ? Math.max(...arr.map(o => o.id)) + 1 : 1;

  // -----------------------------
  // Estado global
  // -----------------------------
  let accounts = [
    { id: 1, name: 'Físico', balance: 0 },
    { id: 2, name: 'Nequi', balance: 0 },
    { id: 3, name: 'Lulo', balance: 0 },
    { id: 4, name: 'Bolsillo', balance: 0 } // se calcula como suma de ciertos bolsillos
  ];
  let debts = [], credits = [], history = [];

  const sueldoBase = 811750;
  let sueldoGanado = 0;
  // Para manejar la "última contribución" por bolsillo al editar
  let lastContribution = {}; // { pocketId: montoAsignadoEnUltimaAccion }

  const pockets = [
    { id:1, name:'💪 Metas Económicas', pct:0.15, total:0, desires:[] },
    { id:2, name:'🩺 Salud', pct:0.10, total:0, desires:[] },
    { id:3, name:'🛒 Mis detalles', pct:0.05, total:0, desires:[] },
    { id:4, name:'🐈 Mascotas', pct:0.05, total:0, desires:[] },
    { id:5, name:'🔌 Inversión electrónicos', pct:0.10, total:0, desires:[] },
    { id:6, name:'🎁 Regalos', pct:0.00, total:0, desires:[] },
    { id:7, name:'⛺ Viajes/comidas', pct:0.10, total:0, desires:[] },
    { id:8, name:'💰 Ahorro', pct:0.45, total:0, desires:[] }
  ];
  // Inicializar lastContribution en cero para cada bolsillo
  pockets.forEach(p => lastContribution[p.id] = 0);

  // -----------------------------
  // Renderers
  // -----------------------------
function renderAccounts() {
  const c = document.getElementById('accounts');
  c.innerHTML = '';

  // Calcular el saldo del bolsillo (cuenta id=4) como suma de pockets 1,2,3,4,5,7
const sumBolsillo = pockets
  .filter(p => [1, 2, 3, 4, 5, 6, 7].includes(p.id)) // incluir ID 6: Regalos
  .reduce((s, p) => s + p.total, 0);
  accounts.find(a => a.id === 4).balance = sumBolsillo;

  // Calcular "Lulo" (id=3) = accounts[2].balance + pocket Ahorro (id=8).total
  const userLulo = accounts.find(a => a.id === 3).balance;
  const ahorroTotal = pockets.find(p => p.id === 8).total;
const sumA = accounts.filter(a => a.id < 4).reduce((s, a) => s + a.balance, 0) + ahorroTotal;
  const displayLulo = userLulo + ahorroTotal;

  accounts.forEach(a => {
    const col = document.createElement('div');
    col.className = 'col-md-3';

    let displayBalance = a.balance;
    if (a.id === 3) displayBalance = displayLulo;
    if (a.id === 4) displayBalance = sumBolsillo;

    col.innerHTML = `
      <div class="card account-card acc-${a.id}" data-id="${a.id}">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div><span class="acc-emoji"></span><strong>${a.name}</strong></div>
          <div>
            <span class="balance">${fmt.format(displayBalance)}</span>
            ${a.id < 4 ? '<button class="btn btn-sm btn-outline-light edit-account ms-2">✎</button>' : ''}
          </div>
        </div>
      </div>`;
    c.append(col);
  });
}


  function renderList(type) {
    const arr = type === 'debt' ? debts : credits;
    const cont = document.getElementById(type === 'debt' ? 'debts-list' : 'credits-list');
    cont.innerHTML = '';

    arr.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.dataset.id = item.id;
      li.innerHTML = `
        <div class="d-flex justify-content-between">
          <strong>${item.person}</strong> — ${fmt.format(item.total)}
        </div>
        <ul class="sub-list list-group mt-2"></ul>
        <button class="btn btn-sm btn-primary sub-add" data-type="${type}" data-id="${item.id}">+ Sumar a ${item.person}</button>`;
      const su = li.querySelector('.sub-list');

      item.entries.forEach((e, i) => {
        const sub = document.createElement('li');
        sub.className = 'list-group-item d-flex justify-content-between align-items-center';
        sub.dataset.idx = i;
        sub.innerHTML = `
          <span>${e.reason}: ${fmt.format(e.amount)}</span>
          <div>
            <button class="btn btn-sm btn-success sub-done me-1">Hecho</button>
            <button class="btn btn-sm btn-danger sub-delete me-1">Eliminar</button>
            <button class="btn btn-sm btn-secondary sub-edit">✎</button>
          </div>`;
        su.append(sub);
      });

      cont.append(li);
    });
  }

function calcAndRenderTotals() {
  // 1) Sumar deudas y créditos
  const sumD = debts.reduce((s, d) => s + d.total, 0);
  const sumC = credits.reduce((s, c) => s + c.total, 0);

  // —> Aquí actualizamos los spans correspondientes:
  document.getElementById('sum-deudas').innerText  = fmt.format(sumD);
  document.getElementById('sum-credits').innerText = fmt.format(sumC);

  // 2) Cuentas puras
  const acc1 = accounts.find(a => a.id === 1).balance; // Físico
  const acc2 = accounts.find(a => a.id === 2).balance; // Nequi
  const acc3 = accounts.find(a => a.id === 3).balance; // Lulo "puro"

  // 3) Tomar el total de Ahorro (pocket ID = 8)
  const ahorroTotal = pockets.find(p => p.id === 8).total;

  // 4) Calcular “Lulo real” = cuenta 3 + ahorro
  const luloReal = acc3 + ahorroTotal;

  // 5) Total sin %: cuentas 1 + 2 + (3 + Ahorro)
  const sumA = acc1 + acc2 + luloReal;
  document.getElementById('total-sin-p').innerText = fmt.format(sumA);

  // 6) Total Deseado: (Total sin %) + créditos - deudas
  const totalDeseado = sumA + sumC - sumD;
  document.getElementById('total-deseado').innerText = fmt.format(totalDeseado);

  // 7) Calcular “Total real”:
  //    - Tomamos “Total deseado”
  //    - Le sumamos (suma de todos los pockets menos lo que ya contamos como ahorro),
  //      para no duplicar Ahorro dos veces. Es decir: pocketsSum - ahorroTotal.
  const pocketsSum   = pockets.reduce((s, p) => s + p.total, 0);
  const restoPockets = pocketsSum - ahorroTotal;
  const totalReal    = totalDeseado + restoPockets;

  document.getElementById('total-real').innerText = fmt.format(totalReal);
}


  
  function renderPockets() {
    const c = document.getElementById('pockets');
    c.innerHTML = '';

    // Sueldo tarjeta
    const suDiv = document.createElement('div');
    suDiv.className = 'col-12';
    suDiv.innerHTML = `
      <div class="card pocket-card">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <div><strong>Sueldo Base:</strong> ${fmt.format(sueldoBase)}</div>
            <div>
              <strong>Sueldo Actual:</strong> ${fmt.format(sueldoGanado)}
              <button id="edit-sueldo" class="btn btn-sm btn-outline-primary ms-2">✎</button>
              <button id="add-sueldo" class="btn btn-sm btn-outline-success ms-1">+ Agregar</button>
            </div>
          </div>
        </div>
      </div>`;
    c.append(suDiv);

    // Cada bolsillo
    pockets.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-3';
      col.innerHTML = `
        <div class="card pocket-card h-100">
          <div class="card-body d-flex flex-column">
            <div class="pocket-header">${p.name}</div>
            ${p.id!==6
              ? `<div class="small">Sueldo Base: ${fmt.format(Math.round(p.pct * sueldoBase))}</div>
                 <div class="small">Sueldo Actual: ${fmt.format(Math.round(p.pct * sueldoGanado))}</div>`
              : `<div class="small">Base fija: 10 000</div>`}
            <div class="mt-2"><strong>Total acum.:</strong> ${fmt.format(p.total)}</div>
            ${p.id!==6
              ? `<button class="btn btn-sm btn-primary add-desire mt-auto" data-id="${p.id}">+ Agregar deseo</button>`
              : `<button class="btn btn-sm btn-warning add-regalo mt-auto">+10 000 Regalo</button>`}
            <ul class="pocket-desires list-group mt-3"></ul>
          </div>
        </div>`;
      c.append(col);

      // Render deseos
      const ul = col.querySelector('.pocket-desires');
      p.desires.forEach((d, i) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <span>${d.motivo}: ${fmt.format(d.monto)}</span>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-success desire-done" data-p="${p.id}" data-i="${i}">Hecho</button>
            <button class="btn btn-secondary desire-edit" data-p="${p.id}" data-i="${i}">✎</button>
            <button class="btn btn-info desire-pay"  data-p="${p.id}" data-i="${i}">Abonar</button>
            <button class="btn btn-info desire-loan" data-p="${p.id}" data-i="${i}">Préstamo</button>
            <button class="btn btn-danger desire-del"  data-p="${p.id}" data-i="${i}">Eliminar</button>
          </div>`;
        ul.append(li);
      });
    });
  }

  // -----------------------------
  // Desglose de deudas en modal
  // -----------------------------
  document.querySelector('.breakdown-trigger').onclick = () => {
    const tbody = document.querySelector('#breakdown-table tbody');
    tbody.innerHTML = '';
    debts.forEach(d => 
      d.entries.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${d.person}</td><td>${e.reason}</td><td>${fmt.format(e.amount)}</td>`;
        tbody.append(tr);
      })
    );
    new bootstrap.Modal(document.getElementById('modalBreakdown')).show();
  };

  // -----------------------------
  // Manejar clics globales
  // -----------------------------
  document.body.addEventListener('click', e => {
    // 1) Agregar Deuda / Crédito
    if (e.target.matches('#add-debt'))   return addEntry('debt');
    if (e.target.matches('#add-credit')) return addEntry('credit');

    // 2) Editar cuenta
// -----------------------------
// Editar cuenta (incluye caso especial para Lulo)
// -----------------------------
if (e.target.matches('.edit-account')) {
  const card = e.target.closest('.account-card');
  const id = +card.dataset.id;
  const acc = accounts.find(a => a.id === id);

  // 1) Si es Lulo (id === 3): solo agregamos un monto manual a la cuenta, sin tocar pockets
  if (id === 3) {
    // Calculamos cuánto vale Lulo “real” (cuenta 3 + pocket Ahorro)
    const ahorro = pockets.find(p => p.id === 8).total;
    const luloReal = acc.balance + ahorro;

    // Prompt para “¿Cuánto desea agregar manualmente a Lulo?”
    const raw = prompt(
      `Lulo actual: ${fmt.format(luloReal)}\n¿Cuánto desea agregar manualmente a Lulo?`,
      "0"
    )?.replace(',', '.');
    const v = parseFloat(raw);
    if (isNaN(v) || v <= 0) {
      return showToast('Monto inválido', '#c00');
    }

    // Sumamos ese monto directo a la cuenta Lulo (accounts[3].balance),
    // sin tocar ningún pocket ni sueldoGanado.
    acc.balance += v;
    history.unshift({
      date: new Date().toISOString().slice(0, 10),
      type: 'suma',
      detail: `Lulo incrementado manual ${fmt.format(v)}`
    });
    return refreshAll();
  }

  // 2) Para cualquier otra cuenta (Físico, Nequi, Bolsillo), dejamos la lógica original:
  const span = card.querySelector('.balance');
  const inp = document.createElement('input');
  inp.type = 'number';
  inp.value = acc.balance;
  span.replaceWith(inp);
  inp.focus();

  inp.onblur = () => {
    const valor = parseFloat(inp.value.replace(',', '.'));
    if (isNaN(valor)) {
      showToast('Saldo inválido', '#c00');
      inp.replaceWith(span);
    } else {
      acc.balance = valor;
      history.unshift({
        date: new Date().toISOString().slice(0, 10),
        type: 'edicion',
        detail: `Saldo de ${acc.name} modificado a ${fmt.format(valor)}`
      });
      refreshAll(); // recarga todo (incluido “Lulo”)
    }
  };
  return;
}

    // 3) Sub-entradas (Deuda/Crédito)
    if (e.target.matches('.sub-add')) {
      // Botón "+ Sumar a X"
      const type = e.target.dataset.type,
            id   = +e.target.dataset.id,
            arr  = type === 'debt' ? debts : credits,
            it   = arr.find(o => o.id === id);
      return addSubEntry(type, it);
    }
    if (e.target.closest('#debts-list li, #credits-list li')) {
      const subLi = e.target.closest('li'),
            parent = subLi.closest('li[data-id]'),
            isDebt = parent.closest('#debts-list') != null,
            arr    = isDebt ? debts : credits,
            it     = arr.find(o => o.id == parent.dataset.id),
            idx    = +subLi.dataset.idx,
            entry  = it.entries[idx];

      // a) Hecho
      if (e.target.matches('.sub-done')) {
        const accId = +prompt('Cuenta (1:Físico,2:Nequi,3:Lulo):'),
              acc   = accounts.find(a => a.id === accId);
        if (!acc) return showToast('Cuenta inválida','#c00');
        if (isDebt && acc.balance < entry.amount) return showToast('Saldo insuficiente','#c00');
        acc.balance += (isDebt ? -1 : 1) * entry.amount;
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: isDebt ? 'resta' : 'suma',
          detail: `COMPLETADO pago de ${it.person} en ${isDebt?'deudas':'créditos'} a ${acc.name} ${fmt.format(entry.amount)}`
        });
        it.total -= entry.amount;
        it.entries.splice(idx,1);
        if (!it.entries.length) arr.splice(arr.indexOf(it),1);
        return refreshAll();
      }
      // b) Eliminar sub
      if (e.target.matches('.sub-delete')) {
        if (!confirm('Eliminar esta sub-entrada?')) return;
        it.total -= entry.amount;
        it.entries.splice(idx,1);
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'edicion',
          detail: `ELIMINADO ${fmt.format(entry.amount)} de ${it.person}`
        });
        if (!it.entries.length) arr.splice(arr.indexOf(it),1);
        return refreshAll();
      }
      // c) Editar sub
      if (e.target.matches('.sub-edit')) {
        const nr  = prompt('Razón:', entry.reason),
              raw = prompt('Monto:', entry.amount).replace(',','.'),
              na  = parseFloat(raw);
        if (nr) entry.reason = nr;
        if (!isNaN(na) && na > 0) {
          it.total += na - entry.amount;
          entry.amount = na;
        }
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'edicion',
          detail: `EDITADO sub-entrada ${it.person}`
        });
        return refreshAll();
      }
    }

    // 4) Filtrar historial
    if (e.target.matches('#filter-apply')) {
      renderHistory({
        from: document.getElementById('filter-from').value,
        to:   document.getElementById('filter-to').value,
        type: document.getElementById('filter-type').value,
        text: document.getElementById('filter-text').value
      });
      return;
    }

    // 5) Export / Import
    if (e.target.matches('#btn-export')) {
      const st = { accounts, debts, credits, history, pockets, sueldoGanado, lastContribution };
      const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob),
            a    = document.createElement('a');
      a.href = url; a.download = 'gastos.json'; a.click(); URL.revokeObjectURL(url);
      return;
    }
    if (e.target.matches('#btn-import')) {
      document.getElementById('file-input').click();
      return;
    }

    // 6) Sueldo ganado
    if (e.target.matches('#edit-sueldo')) {
      const raw = prompt('Nuevo sueldo ganado:', sueldoGanado).replace(',', '.'),
            v   = parseFloat(raw);
      if (!isNaN(v)) {
        // Revertir última contribución
        pockets.forEach(p => {
          p.total -= (lastContribution[p.id] || 0);
          lastContribution[p.id] = 0;
        });
        sueldoGanado = v;
        // Recalcular nueva contribución
        pockets.forEach(p => {
          if (p.id !== 6) {
            const contrib = Math.round(p.pct * v);
            p.total += contrib;
            lastContribution[p.id] = contrib;
          }
        });
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'edicion',
          detail: `Sueldo ganado editado a ${fmt.format(v)}`
        });
        return refreshAll();
      }
    }
if (e.target.matches('#add-sueldo')) {
  const raw = prompt('Monto a agregar:').replace(',', '.'),
        v   = parseFloat(raw);
  if (isNaN(v) || v <= 0) return showToast('Monto inválido','#c00');

  sueldoGanado += v; // 🔁 Sumar, no reemplazar

  pockets.forEach(p => {
    if (p.id !== 6) {
      const contrib = Math.round(p.pct * v); // Usa el valor agregado, no sueldo total
      p.total += contrib;
      lastContribution[p.id] = (lastContribution[p.id] || 0) + contrib;
    }
  });

  history.unshift({
    date: new Date().toISOString().slice(0,10),
    type: 'suma',
    detail: `Sueldo ganado agregado ${fmt.format(v)}`
  });

  return refreshAll();
}


    // 7) Regalo fijo (+10.000) descuenta de "Bolsillo" (cuenta 4)
if (e.target.matches('.add-regalo')) {
  const p6   = pockets.find(p => p.id === 6);   // “Regalos”
  const p8   = pockets.find(p => p.id === 8);   // “Ahorro”
  // Verificamos que Ahorro tenga al menos 10 000
  if (p8.total < 10000) {
    return showToast('Saldo Ahorro insuficiente','#c00');
  }
  p8.total -= 10000;
  p6.total += 10000;
  history.unshift(
    { date: new Date().toISOString().slice(0,10), type:'resta', detail:'Regalo 10 000 descontado de Ahorro' },
    { date: new Date().toISOString().slice(0,10), type:'suma',  detail:'Regalo 10 000 añadido a Regalos' }
  );
  return refreshAll();
}


    // 8) Deseos en bolsillos
    if (e.target.matches('.add-desire')) {
      const pid = +e.target.dataset.id,
            p   = pockets.find(x => x.id === pid);
      const motivo = prompt('Motivo:'),
            raw = prompt('Monto:').replace(',', '.'),
            m   = parseFloat(raw);
      if (!motivo || isNaN(m) || m <= 0) return showToast('Monto inválido','#c00');
      p.desires.push({ monto: m, motivo });
      history.unshift({
        date: new Date().toISOString().slice(0,10),
        type: 'resta',
        detail: `Deseo ${p.name} ${motivo} ${fmt.format(m)}`
      });
      return refreshAll();
    }

    // Delegación para botones dentro de cada deseo
    const desireBtn = e.target.closest('.pocket-desires li button');
    if (desireBtn) {
      const pid = +desireBtn.dataset.p,
            idx = +desireBtn.dataset.i,
            p   = pockets.find(x => x.id === pid),
            d   = p.desires[idx];

      // a) Hecho
      if (desireBtn.matches('.desire-done')) {
        if (p.total < d.monto) return showToast('Saldo insuficiente','#c00');
        p.total -= d.monto;
        p.desires.splice(idx,1);
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'resta',
          detail: `Deseo completado ${p.name} ${d.motivo} ${fmt.format(d.monto)}`
        });
        return refreshAll();
      }
      // b) Abonar
      if (desireBtn.matches('.desire-pay')) {
        const raw = prompt('Monto a abonar:').replace(',', '.'),
              m   = parseFloat(raw);
        if (isNaN(m) || m <= 0) return showToast('Monto inválido','#c00');
        if (p.total < m) return showToast('Saldo insuficiente','#c00');
        p.total  -= m;
        d.monto  -= m;
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'resta',
          detail: `Abono ${p.name} ${d.motivo} ${fmt.format(m)}`
        });
        if (d.monto <= 0) p.desires.splice(idx,1);
        return refreshAll();
      }
      // c) Editar deseo
      if (desireBtn.matches('.desire-edit')) {
        const nm    = prompt('Nuevo motivo:', d.motivo),
              raw   = prompt('Nuevo monto:', d.monto).replace(',', '.'),
              nmonto= parseFloat(raw);
        if (nm)       d.motivo = nm;
        if (!isNaN(nmonto) && nmonto > 0) d.monto = nmonto;
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'edicion',
          detail: `Deseo editado ${p.name} ${d.motivo}`
        });
        return refreshAll();
      }
      // d) Convertir a deuda
      if (desireBtn.matches('.desire-loan')) {
        if (!confirm('Convertir en deuda?')) return;
        debts.push({
          id: genId(debts),
          person: p.name,
          entries: [{ reason:d.motivo, amount:d.monto }],
          total: d.monto
        });
        p.desires.splice(idx,1);
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'resta',
          detail: `Deseo convertido en deuda ${p.name} ${d.motivo}`
        });
        return refreshAll();
      }
      // e) Eliminar deseo
      if (desireBtn.matches('.desire-del')) {
        if (!confirm('Eliminar deseo?')) return;
        p.desires.splice(idx,1);
        history.unshift({
          date: new Date().toISOString().slice(0,10),
          type: 'edicion',
          detail: `Deseo eliminado ${p.name}`
        });
        return refreshAll();
      }
    }
  });

  // -----------------------------
  // Historial
  // -----------------------------
  function renderHistory(filters = {}) {
    let list = [...history].reverse();
    if (filters.from) list = list.filter(h => h.date >= filters.from);
    if (filters.to)   list = list.filter(h => h.date <= filters.to);
    if (filters.type) list = list.filter(h => h.type === filters.type);
    if (filters.text) list = list.filter(h => h.detail.includes(filters.text));
    const ul = document.getElementById('history-list');
    ul.innerHTML = '';
    list.forEach(h => {
      const li = document.createElement('li');
      li.className = 'list-group-item ' + (h.type === 'resta' ? 'text-danger' : 'text-success');
      li.innerText = `[${h.date}] ${h.detail}`;
      ul.append(li);
    });
  }

  // -----------------------------
  // Helpers y Refresh
  // -----------------------------
  function refreshAll() {
    renderAccounts();
    renderList('debt');
    renderList('credit');
    calcAndRenderTotals();
    renderPockets();
    renderHistory();
  }

  function addEntry(type) {
    const person = prompt('Nombre de la persona:'); if (!person) return;
    const reason = prompt('Razón:');
    const raw    = prompt('Monto:').replace(',','.');
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount <= 0) return showToast('Monto inválido','#c00');
    const arr = type === 'debt' ? debts : credits;
    arr.push({ id: genId(arr), person, entries:[{ reason, amount }], total: amount });
    history.unshift({
      date: new Date().toISOString().slice(0,10),
      type: type === 'debt' ? 'resta' : 'suma',
      detail: `CREADA ${type === 'debt'?'deuda':'crédito'} ${person} ${fmt.format(amount)}`
    });
    refreshAll(); showToast(`${type === 'debt'?'Deuda':'Crédito'} creada`);
  }

  function addSubEntry(type, item) {
    const reason = prompt('Razón adicional:');
    const raw    = prompt('Monto:').replace(',','.');
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount <= 0) return showToast('Monto inválido','#c00');
    item.entries.push({ reason, amount });
    item.total += amount;
    history.unshift({
      date: new Date().toISOString().slice(0,10),
      type: type === 'debt' ? 'resta' : 'suma',
      detail: `SUMA a ${item.person} ${fmt.format(amount)}`
    });
    return refreshAll();
  }

  // -----------------------------
  // Importar JSON
  // -----------------------------
  document.getElementById('file-input').onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (!confirm('Sobrescribir estado actual?')) return;
      const s = JSON.parse(reader.result);
      accounts    = s.accounts;
      debts       = s.debts;
      credits     = s.credits;
      history     = s.history;
      pockets.forEach((p,i) => {
        p.total   = s.pockets[i].total;
        p.desires = s.pockets[i].desires;
      });
      sueldoGanado      = s.sueldoGanado;
      lastContribution  = s.lastContribution;
      refreshAll(); showToast('JSON importado','#007bff');
    };
    reader.readAsText(file);
  };

  window.addEventListener('beforeunload', e => { e.preventDefault(); e.returnValue = ''; });
  refreshAll();
})();
