import forge from "node-forge";
import fs from "fs";

// read your existing private key
const privateKeyPem = fs.readFileSync("key.pem", "utf8");
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

// create certificate
const cert = forge.pki.createCertificate();
cert.publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
cert.serialNumber = "01";

cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

// subject & issuer (self-signed)
const attrs = [{ name: "commonName", value: "localhost" }];
cert.setSubject(attrs);
cert.setIssuer(attrs);

// sign certificate
cert.sign(privateKey);

// convert to PEM
const certPem = forge.pki.certificateToPem(cert);

// save cert
fs.writeFileSync("cert.pem", certPem);

console.log("✅ Proper cert.pem generated");