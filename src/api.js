import axios from 'axios';

//const apiUrl = 'https://cev.tuntrust.tn/TuntrustCev/signatureWs';
const apiUrl = 'https://www.facebook.com/';


export const api = axios.create({baseURL: apiUrl,
    headers: { 'Content-Type': 'text/xml;charset=UTF-8',
    SOAPAction: 'https://my-soap-action/something',}});
