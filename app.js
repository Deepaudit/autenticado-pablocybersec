function validate(code){
  if(!code){show("invalid","Código inválido","<p>Informe um código de certificado.</p>");return}
  if(code===DEMO_CODE){
    show("valid","Certificado válido",
      `<p><b>Nome:</b> ${DEMO_NAME}</p><p><b>Formação:</b> ${DEMO_COURSE}</p><p><b>Código:</b> <span>${code}</span></p><p>Registro de demonstração da PabloCyberSec.</p>`);
    return;
  }
  const found=records.find(x=>norm(x.code)===code);
  if(found){
    const studentName=String(found.name||"").trim()||"Nome não informado";
    show("valid","Certificado válido",`<p><b>Nome:</b> ${esc(studentName)}</p><p><b>Código:</b> ${esc(found.code)}</p>`);
  }else{
    show("invalid","Código inválido",`<p>Não existe aluno cadastrado para o código <b>${esc(code)}</b>.</p>`);
  }
}
