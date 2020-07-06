
const axios = require('axios');
//const debug = require('debug')('LPAuthCtrl');
const FormData = require('form-data');
// const async = require('async');

const dbService = require('../services/db-service');

exports.index = function(req, res) {   
    res.send('LPAuth');
};

//This function gets a URL of a license plate picture
//and returns an object with the resulting vehicle number or error in parsedText
const imgToText = async (url) => {
    var answer = {
        GotError: false,
        parsedText: ""
    };
    debug("imgToText: url =", url);
    // COPY FROM WEBSITE:
    var data = new FormData();
    data.append('language', 'eng');
    data.append('isOverlayRequired', 'false');
    //TODO: Get URL from parameter at the top:
    data.append('url', url);
    data.append('iscreatesearchablepdf', 'false');
    data.append('issearchablepdfhidetextlayer', 'false');

    const config = {
        method: 'post',
        url: 'https://api.ocr.space/parse/image',
        headers: { 
            'apikey': '61d195488d88957', 
            ...data.getHeaders()
        },
        data : data
    };

    await axios(config)
    .then(function (response) {
        debug("imgToText: response.data =", response.data);
        if (response.data.IsErroredOnProcessing){
            answer.GotError = true;
            answer.parsedText = response.data.ErrorMessage;
        }else{ 
            answer.parsedText = JSON.stringify(response.data.ParsedResults[0].ParsedText);
        }
        debug("imgToText: parsedText =", answer.parsedText);
    })
    .catch(function (error) {
        answer.GotError = true;
        answer.parsedText = error;
        debug("imgToText Error: parsedText =", parsedText);
    });
    
    debug("imgToText returns: ", answer.parsedText);
    return answer;
}
    

const imgToText_OLD = () => {
    //Send POST Req w URL & APIKey to OCR :
    // const headers = {
    //     'apikey': '61d195488d88957'
    // }

    // axios.post('https://api.ocr.space/parse/image', {
    //     url: 'http://dl.a9t9.com/ocrbenchmark/eng.png'
    //   },  {
    //     headers: headers
    //   })
    //   .then((res) => {

    //     console.log(`statusCode: ${res.statusCode}`)
    //     console.log(res)
    //   })
    //   .catch((error) => {
    //     console.error(error)
    //   })
}

const licensePlateTextToVehicleNumber = (licensePlate) => {
    debug("licensePlateTextToVehicleNumber: ", licensePlate);
    var ans = "";
    for (let i = 0; i < licensePlate.length; i++) {
        const char = licensePlate.charAt(i);
        if (char>=0 && char<=9 || char>='A' && char<='Z')
            ans = ans.concat(char);
    }
    return ans;
}

const licensePlateTextToVehicleNumberOld = (licensePlate) => {
    debug("licensePlateTextToVehicleNumber: ", licensePlate);
    const endOfVehicleNumber = licensePlate.indexOf('\\');
    debug("endOfVehicleNumber = ", endOfVehicleNumber);
    return licensePlate.slice(1,endOfVehicleNumber);
}

const lastTwoDigits = (vehicleNumber) => {
    const len = vehicleNumber.length;
    return vehicleNumber.substr(len-2, 2);
}

const isPublicTransportVehicle = (vehicleNumber) => {
    const lastTwoDig = lastTwoDigits(vehicleNumber);
    return (lastTwoDig.charAt(0)==2 && (lastTwoDig.charAt(1)==5 || lastTwoDig.charAt(1)==6));
}

const isLawEnforcementVehicle = (vehicleNumber) => {
    for (let i = 0; i < vehicleNumber.length; i++) 
        if (vehicleNumber.charAt(i)>='A' && vehicleNumber.charAt(i)<='Z') 
            return true;
}

const sevenLongCaseC = (vehicleNumber) => {
    if (vehicleNumber.length != 7) 
        return {ans: false};
    for (let i = 0; i < vehicleNumber.length; i++) {
        if (vehicleNumber.charCodeAt(i)<48 || vehicleNumber.charCodeAt(i)>57) 
            return {ans: false};
    }
    const lastTwoDig = lastTwoDigits(vehicleNumber);
    if(lastTwoDig.charAt(0)==8 && lastTwoDig.charAt(1)>=5 && lastTwoDig.charAt(1)<=9 ||
        lastTwoDig.charAt(0)==0 && lastTwoDig.charAt(1)==0)
            return {ans: true,
                    lastTwoDigits: lastTwoDig};
    return {ans: false};
}

const isOperatedByGas = (vehicleNumber) => {
    if (vehicleNumber.length != 7 && vehicleNumber.length != 8) 
        return false;

    let sum = 0;    
    for (let i = 0; i < vehicleNumber.length; i++) {
        if (vehicleNumber.charCodeAt(i)<48 || vehicleNumber.charCodeAt(i)>57) 
            return false;
        sum+=vehicleNumber.charAt(i);
    }
    
    if(sum%7 == 0) return true;
}

const isAuthorizedVehicle = (vehicleNumber) => {
    if (isPublicTransportVehicle(vehicleNumber)) return {decision: "Prohibited", reason: "Public Transportation Vehicle"};
    if (isLawEnforcementVehicle(vehicleNumber)) return {decision: "Prohibited", reason: "Law Enforcement Vehicle"};
    const caseC = sevenLongCaseC(vehicleNumber);
    if (caseC.ans) return {decision: "Prohibited", reason: "7 digit number and last two digits are ".concat(caseC.lastTwoDigits)};
    if (isOperatedByGas(vehicleNumber)) return {decision: "Prohibited", reason: "Vehicle Suspected as Operated by Gas"};
    return {decision: "Allowed", reason: "Passed all checks"};
}

exports.check_license_plate_httpGet = async function(req, res) {   
    var responseString = "";
    const {url} = req.query;
    debug(url);

    //TODO: maybe check whether is a valid vehicle number?
    
    //Get License Plate string out of picture:
    const licensePlateTextObject = await imgToText(url);
    if (licensePlateTextObject.GotError){
        responseString = licensePlateTextObject.parsedText;
    }else{
        const vehicleNumber = licensePlateTextToVehicleNumber(licensePlateTextObject.parsedText);
        debug(vehicleNumber);
        
        //Check and Decide by a,b,c,d:
        const decision = isAuthorizedVehicle(vehicleNumber);

        //Write the decision into the DB, with timestamp & reason (if prohibited)
        responseString = vehicleNumber + " : "+ decision;
    }
    res.send(responseString);
};


exports.check_license_plate = async function(req, res) {   
    var responseString = "";
    const {url} = req.body;
    
    //TODO: maybe check whether is a valid vehicle number?
    
    //Get License Plate string out of picture:
    const licensePlateTextObject = await imgToText(url);
    if (licensePlateTextObject.GotError){
        responseString = licensePlateTextObject.parsedText;
    }else{
        const vehicleNumber = licensePlateTextToVehicleNumber(licensePlateTextObject.parsedText);
        
        //Check and Decide by a,b,c,d:
        const decision = isAuthorizedVehicle(vehicleNumber);

        //Write the decision into the DB, with timestamp & reason (if prohibited)
        responseString = vehicleNumber + " is "+ decision.decision + "(" + decision.reason + ")";
        // TODO: add to DB!!!
        dbService.addToDB({
            time: new Date(),//.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            id: vehicleNumber,
            decision: decision.decision,
            reason: decision.reason
        });
    }
    res.send(responseString);
};

