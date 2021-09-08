const express = require('express');
const axios = require('axios');
const cors = require('cors');
// const GET_USER_BY_UID = 'api/v1/users?search=profile.uid+eq+';
const OKTA_BASE_URL = 'https://oie-3751727-admin.oktapreview.com/';
const API_TOKEN = 'SSWS 00TnKVnUZ0eziDta_OgvZJGK7mpChMSnQni_bL9K15';
const API_V1_USERS = 'api/v1/users/';
const USER_NOT_FOUND = 'User not found with this email!';


const app = express();

// CORS
const EXT_CORS_ALLOW_METHODS = 'GET,POST,OPTIONS,PUT,DELETE';
const EXT_CORS_ALLOW_HEADERS = 'Content-Type,authorization,origin,accept';
const ORIGIN = 'https://d8231h5snasls.cloudfront.net';

const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', ORIGIN);
    res.header('Access-Control-Allow-Methods', EXT_CORS_ALLOW_METHODS);
    res.header('Access-Control-Allow-Headers', EXT_CORS_ALLOW_HEADERS);
    res.header('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    } else {
    next();
    }
};

app.use(allowCrossDomain);
app.use(express.json());

app.get('/', async (req, res) => {
    const user = {
        name: "maniraj"
    };
    res.send(user);
});



app.post('/users', async (req, res) => {
    const payload = req.body;
    const oktaTargetUrl = OKTA_BASE_URL + API_V1_USERS + payload.email;
    console.log('Calling getUserOKTA method');
    let oktaData = await getUserOKTA(oktaTargetUrl);
    console.log('getUserOKTA response code:' + oktaData.status);
    if(oktaData && oktaData.status && oktaData.status === 200) {
        oktaData = oktaData.data;
        const firstName = payload.name || oktaData.profile.firstName;
        const lastName = payload.family_name || oktaData.profile.lastName;
        const email = payload.email || oktaData.profile.email;
        const mobilePhone = payload.mobilePhone || oktaData.profile.mobilePhone;
        const experience = payload.experience || oktaData.profile.experience;
        const postalAddress = payload.postalAddress || oktaData.profile.postalAddress;
        const specialization = payload.Specialization || oktaData.profile.specialization;
        const latestDegree = payload.LatestDegree || oktaData.profile.latestDegree;
    
        const userProfile = {
            profile: {
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "mobilePhone": mobilePhone,
                "experience": experience,
                "postalAddress": postalAddress,
                "specialization": specialization,
                "latestDegree": latestDegree,
                "RegistrationStatus": "Y"
            }
        };
        const targetUrl = OKTA_BASE_URL + API_V1_USERS + oktaData.profile.email;
        console.log('Calling updateUserOKTA method');
        let updateResponse = await updateUserOKTA(targetUrl, userProfile);
        console.log('updateUserOKTA response code:' + updateResponse.statusCode);
        if(updateResponse && updateResponse.status && updateResponse.status === 200) {
            updateResponse = updateResponse.data;
            res.send(updateResponse);
        } else {
            const exception = {
                statusCode: updateResponse.status,
                message: updateResponse.data.errorSummary
            };
            res.send(exception);
        }
    } else if(oktaData && oktaData.status && oktaData.status === 404) {
        const exception = {
            statusCode: oktaData.status,
            message: USER_NOT_FOUND
        };
        res.send(exception);
    }
    
});

app.post('/users/flag', async (req, res) => {
    const payload = req.body;
    const oktaTargetUrl = OKTA_BASE_URL +API_V1_USERS + payload.email;
    console.log('Calling getUserOKTA method');
    let oktaData = await getUserOKTA(oktaTargetUrl);
    console.log('getUserOKTA response code:' + oktaData.status);
    if(oktaData && oktaData.status && oktaData.status === 200) {
        oktaData = oktaData.data;
        const email = payload.email;
        const deleteUserFlag = payload.deleteUserFlag || oktaData.profile.latestDegree;

        const userProfile = {
            profile: {
                "email": email,
                "deleteUserFlag": deleteUserFlag
            }
        };
        const targetUrl = OKTA_BASE_URL + API_V1_USERS + oktaData.profile.email;
        console.log('Calling updateUserOKTA method');
        let updateResponse = await updateUserOKTA(targetUrl, userProfile);
        console.log('updateUserOKTA response code:' + updateResponse.statusCode);
        if(updateResponse && updateResponse.status && updateResponse.status === 200) {
            updateResponse = updateResponse.data;
            res.send(updateResponse);
        } else {
            const exception = {
                statusCode: updateResponse.status,
                message: updateResponse.data.errorSummary
            };
            res.send(exception);
        }
    } else if(oktaData && oktaData.status && oktaData.status === 404) {
        const exception = {
            statusCode: oktaData.status,
            message: USER_NOT_FOUND
        };
        res.send(exception);
    }
    
});

async function getUserOKTA(targetUrl) {
    const response = await axios.get(targetUrl, {
        headers: {
            'Content_Type': 'application/json',
            Accept:  'application/json',
            Authorization: API_TOKEN
        }
    })
    .then(res => {
        return res;
    })
    .catch(error => {
        console.log('Error in getUserOKTA' + error);
        return error.response;
    });
    return await response;
}

async function updateUserOKTA(targetUrl, payload) {
    const response = await axios.post(targetUrl, payload, {
        headers: {
            'Content_Type': 'application/json',
            Accept:  'application/json',
            Authorization: API_TOKEN
        }
    })
    .then(res => {
        return res;
    })
    .catch(error => {
        return error.response;
    });
    return await response;
}

const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));
