const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configuração para lidar com o envio de formulários e arquivos
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do Multer para armazenamento temporário (requer que o "uploads" exista)
const upload = multer({ dest: 'uploads/' }); // Pasta para armazenar os arquivos temporariamente

// Configuração do transporte do Nodemailer para enviar e-mail com Outlook
const transporter = nodemailer.createTransport({
  service: 'Outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rota POST para enviar o e-mail com os dados do formulário
app.post('/enviar-nota', upload.single('nota_fiscal'), (req, res) => {
  console.log('Dados recebidos:', req.body); // Exibir os dados do formulário
  console.log('Arquivo enviado:', req.file); // Exibir informações sobre o arquivo recebido
  
  const { motorista, placa, data_hora, km, valor_nota } = req.body;
  const nota_fiscal = req.file;

  if (!nota_fiscal) {
    return res.status(400).send('Nenhum arquivo anexado');
  }

  // Configuração do e-mail
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'antonio.almeida@airsupplybr.com',
    subject: 'Nova Nota Fiscal Recebida',
    text: `
      Motorista: ${motorista}
      Placa do Veículo: ${placa}
      Data e Hora: ${data_hora}
      Kilometragem no Abastecimento: ${km}
      Valor da Nota: R$ ${valor_nota}
    `,
    attachments: [
      {
        filename: nota_fiscal.originalname,
        path: nota_fiscal.path,
      },
    ],
  };

  // Envio do e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar o e-mail:', error);
      return res.status(500).send(`Erro ao enviar o e-mail: ${error.message}`);
    }
    console.log('E-mail enviado:', info); // Log quando o e-mail for enviado com sucesso
    return res.status(200).send('E-mail enviado com sucesso');
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
