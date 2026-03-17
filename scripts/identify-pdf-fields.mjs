import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync } from 'fs';

async function main() {
  const pdfBytes = readFileSync('public/forms/application_form.pdf');
  const doc = await PDFDocument.load(pdfBytes);
  const form = doc.getForm();

  for (const field of form.getFields()) {
    const name = field.getName();
    const type = field.constructor.name;

    if (type === 'PDFTextField') {
      const tf = form.getTextField(name);
      tf.setText(name);
    } else if (type === 'PDFCheckBox') {
      const cb = form.getCheckBox(name);
      cb.check();
    }
    console.log(`${type}: ${name}`);
  }

  const out = await doc.save();
  writeFileSync('public/forms/application_form_identified.pdf', out);
  console.log('\nSaved: public/forms/application_form_identified.pdf');
}

main().catch(console.error);
