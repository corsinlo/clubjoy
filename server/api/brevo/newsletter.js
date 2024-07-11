//const SibApiV3Sdk = require('@getbrevo/brevo');
const sdkUtils = require('../../api-util/sdk');

const SibApiV3Sdk = require('sib-api-v3-sdk');
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;


//const brevoClient = new SibApiV3.TransactionalEmailsApi();
//let sendSmtpEmail = new SibApiV3.SendSmtpEmail();

module.exports = async (req, res) => {
  {
    console.log('req.body:', req.body)
    const { email, listId, firstName, lastName, isNewsLetter, isSignup } = req.body;

    let apiInstance = new SibApiV3Sdk.ContactsApi();
    let createContact = new SibApiV3Sdk.CreateContact();
    createContact.email = email;

    if(isNewsLetter && isSignup) {
    createContact.listIds = [4, 7]
    } else if(isNewsLetter && !isSignup) {
    createContact.listIds = [4]
    }else if(!isNewsLetter && isSignup) {
    createContact.listIds = [7]
    }

    createContact.attributes = {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
    };
    
 
      console.log('createContact:', createContact);
      apiInstance.createContact(createContact).then(function(data) {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      }, function(error) {
        console.error(error);
      });
  }
};
