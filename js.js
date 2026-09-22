function exportFeliosEconomia(){


let text="";


const fecha = new Date()
.toISOString()
.slice(0,10);



function cleanValue(value){

    if(value <= 1){
        return "pendiente";
    }

    return value;

}



function getPocketEmoji(name){

    const match=name.match(/^\S+/);

    return match ? match[0] : "💰";

}



text+=`[FELIOS_ECONOMIA_V1.1]\n\n`;

text+=`tipo:economia\n`;

text+=`fecha:${fecha}\n\n`;



// ===============================
// CUENTAS
// ===============================


text+=`
====================
💰 CUENTAS
====================

`;


accounts.forEach(acc=>{


text+=`CUENTA\n`;

text+=`emoji:${getEmojiCuenta(acc.name)}\n`;

text+=`nombre:${acc.name}\n`;

text+=`saldo:${acc.balance}\n`;

text+=`tipo:cuenta\n\n`;


});




// ===============================
// INGRESOS
// ===============================


text+=`
====================
💼 INGRESOS
====================

`;


text+=`INGRESO\n`;

text+=`emoji:💼\n`;

text+=`nombre:Sueldo\n`;

text+=`valor:${sueldoGanado}\n\n`;





// ===============================
// BOLSILLOS / METAS
// ===============================


text+=`
====================
🎯 BOLSILLOS ECONÓMICOS
====================

`;



pockets.forEach(p=>{


if(p.id===8)
return;



text+=`BOLSILLO\n`;

text+=`emoji:${getPocketEmoji(p.name)}\n`;

text+=`nombre:${p.name.replace(/^\\S+\\s*/,'')}\n`;

text+=`categoria:${p.name}\n`;

text+=`porcentaje:${p.pct*100}\n`;

text+=`acumulado:${p.total}\n\n`;



if(p.desires.length){



p.desires.forEach(d=>{


text+=`OBJETIVO\n`;

text+=`nombre:${d.motivo}\n`;

text+=`valor:${cleanValue(d.monto)}\n`;

text+=`estado:activo\n`;

text+=`url:\n`;

text+=`nota:\n\n`;


});


}



});




// ===============================
// AHORRO
// ===============================


const ahorro=pockets.find(
p=>p.id===8
);


text+=`
====================
💰 AHORRO
====================

`;


text+=`tipo:ahorro\n`;

text+=`porcentaje:${ahorro.pct*100}\n`;

text+=`acumulado:${ahorro.total}\n\n`;





// ===============================
// DEUDAS
// ===============================


text+=`
====================
🤝 DEUDAS
====================

`;



debts.forEach(d=>{


text+=`PERSONA\n`;

text+=`nombre:${d.person}\n`;

text+=`valor:${d.total}\n`;


d.entries.forEach(e=>{


text+=`detalle:${e.reason}\n`;

text+=`monto:${e.amount}\n`;


});


text+=`\n`;


});




// ===============================
// ME DEBEN
// ===============================


text+=`
====================
💳 ME DEBEN
====================

`;



credits.forEach(c=>{


text+=`PERSONA\n`;

text+=`nombre:${c.person}\n`;

text+=`valor:${c.total}\n`;


c.entries.forEach(e=>{


text+=`detalle:${e.reason}\n`;

text+=`monto:${e.amount}\n`;


});


text+=`\n`;

});






text+=`[/FELIOS]`;



navigator.clipboard
.writeText(text)

.then(()=>{


showToast(
"🧠 Economía exportada para FeliOS V1.1"
);


});


}
