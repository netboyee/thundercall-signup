import React, {useEffect, useState} from 'react';
import {Form, Button, Col, Row, Spinner} from 'react-bootstrap';
import {globals} from './globals';
import {schemas} from './schema';
import TextComponent from './TextComponent';
import axios from 'axios';

const Signup = () => {

    const generateRandomId = () => 
    {
        let min = 1000000;
        let max = 1999999;
        let random = Math.floor(Math.random() * (max - min) + min);
        let randomstr = "RD" + random.toString();
        return randomstr;
    }

    const [usState, setUSState] = useState("AL");
    const [torStatus, setTorStatus] = useState(false);
    const [severeStatus, setSevere] = useState(false);
    const [winStatus, setWinStatus] = useState(false);
    const [flashStatus, setFlashStatus] = useState(false);
    const [error, setError] = useState("");
    const [color, setColor] = useState('none');
    const [display, setDisplay] = useState('block');
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [defDisplay, setDefaultDisplay] = useState({defaultDisplay: 'block', submissionDisplay: 'none'})
    const [isLoading, setIsLoading] = useState({spinnerDisplay: 'none', buttonClasses: 'sbbtn'});

    var accountId = parseInt(process.env.REACT_APP_ACCOUNT_ID);
    var externalId = generateRandomId();

    const updateDefaultDisplay = () => {
        setDefaultDisplay(defDisplay => defDisplay = {
            submissionDisplay: 'block',
            defaultDisplay: 'none'
        })
    }

    const postData = {
        method: 'post',
        url: `${globals.API_BASE_URL}/api/users/signup`,
        headers: {
            'accept': 'application/json, text/plain',
            'Content-Type' : 'application/json'
        },
        data: ""
    }

    const updateFirstName = (val) => {
        setFirstName(val)
    }

    const updateLastName = (val) => {
        setLastName(val)
    }

    const updateEmailAddress = (val) => {
        setEmailAddress(val)
    }

    const updatePhoneNumber = (val) => {
        setPhoneNumber(val)
    }

    const updateAddress = (val) => {
        setAddress(val)
    }

    const updateCity = (val) => {
        setCity(val)
    }

    const updateZip = (val) => {
        setZip(val)
    }

    const updateExternalId = () => {
        externalId = generateRandomId();
        schemas.postBody.externalId = externalId;
    }

    const statePicker = (e) => {
        setUSState(usState => usState = e.target.value);
    }

    const ocTorStatus = () => {
        setTorStatus(torStatus => torStatus = !torStatus)
    }

    const ocSevStatus = () => {
        setSevere(severeStatus => severeStatus = !severeStatus);
    }

    const ocWinStatus = () => {
        setWinStatus(winStatus => winStatus = !winStatus);
    }

    const ocFFStatus = () => {
        setFlashStatus(flashStatus => flashStatus = !flashStatus);
    }

    const setPostBody = () => {
        schemas.postBody.addresses[0].stateProvince = usState;
        schemas.postBody.phones[0].phoneNumber = phoneNumber;
        schemas.postBody.emails[0].emailAddress = emailAddress;
        schemas.postBody.lastName = lastName;
        schemas.postBody.firstName = firstName;
        schemas.postBody.addresses[0].address = address;
        schemas.postBody.addresses[0].city = city;
        schemas.postBody.addresses[0].zipPostalCode = zip;
        schemas.postBody.externalId = externalId;
        schemas.postBody.accountId = accountId;
        delete schemas.postBody.companyId;
        schemas.postBody.tcall = true;
        warnings('tor');
        warnings('severe');
        warnings('winterstorm');
        warnings('ff');
    }

    const onSubmit = () => {
        setIsLoading(isLoading => isLoading = {
            spinnerDisplay: 'inline-block',
            buttonClasses: 'sbbtn disabled'
        });
        updateExternalId();
        schemas.postBody.addresses[0].thundercall.warningTypes = [];
        setPostBody();
        postData.data = JSON.stringify(schemas.postBody);
        console.log(postData);
        if(!validation())
        {
            setIsLoading(isLoading => isLoading = {
                spinnerDisplay: 'none',
                buttonClasses: 'sbbtn'
            });
            return;
        }
        else 
        {
            axios(postData).then(res => {
                updateDefaultDisplay();
            })
            .catch(err => {
                const message = err?.response?.data?.message || "Submission failed";
                if(message === "Record already exists.")
                {
                    setValidationState(message + ": Please retry submission");
                }
                else
                {
                    setValidationState(message);
                }
                setIsLoading(isLoading => isLoading = {
                    spinnerDisplay: 'none',
                    buttonClasses: 'sbbtn'
                });
            })
        }
    }

    const setValidationState = (stringtoshow) => {
        setColor('red');
        setError(stringtoshow);
        setDisplay('inline');
    }

    const validation = () => {
        if(schemas.postBody.firstName === "")
        {
            setValidationState("First name required");
            return false;
        }
        if(schemas.postBody.lastName === "")
        {
            setValidationState("Last name required");
            return false;
        }
        if(schemas.postBody.emails[0].emailAddress === "")
        {
            setValidationState("Email address required");
            return false;
        }
        if(schemas.postBody.phones[0].phoneNumber === "")
        {
            setValidationState("Phone number required");
            return false;
        }
        if(schemas.postBody.addresses[0].city === "")
        {
            setValidationState("City required");
            return false;
        }
        if(schemas.postBody.addresses[0].address === "")
        {
            setValidationState("Address required");
            return false;
        }
        if(schemas.postBody.addresses[0].stateProvince === "")
        {
            setValidationState("State Required");
            return false;
        }
        if(schemas.postBody.addresses[0].zipPostalCode === "")
        {
            setValidationState("Zip Code Required");
            return false;
        }
        if(schemas.postBody.addresses[0].thundercall.warningTypes.length === 0)
        {
            setValidationState("At least one warning must be selected");
            return false;
        }
        if(externalId === 0)
        {
            updateExternalId();
        }
        return true;
    }
    //Old V3 Warning Type Values
    //TOR = 0
    //FFW = 1
    //SVR = 2
    //WSW = 3
    //TSW = 4
    //DFA = 5
    //FRZ = 6

    const warnings = (warn) => {
        switch(warn)
        {
            case 'tor':
                if(torStatus) 
                {
                    schemas.postBody.addresses[0].thundercall.warningTypes.push(0);
                }
                break;
            case 'severe':
                if(severeStatus) 
                {
                    schemas.postBody.addresses[0].thundercall.warningTypes.push(2);
                }
                break;
            case 'winterstorm':
                if(winStatus) 
                {
                    schemas.postBody.addresses[0].thundercall.warningTypes.push(3);
                }
                break;
            case 'ff':
                if(flashStatus) 
                {
                    schemas.postBody.addresses[0].thundercall.warningTypes.push(1);
                }
                break;
            default: 
                break;                               
        }
    }

    useEffect(() => {
    }, [usState, torStatus, severeStatus, winStatus, flashStatus, city, zip, firstName, lastName, emailAddress, address,
        phoneNumber, externalId]);
    
        return (
            <>
            <img src={process.env.REACT_APP_HEADER} className="img-fluid" alt="..."/>
            <div className="container" style={{display: defDisplay.defaultDisplay}}>
                <p className="thundercalltm">Sign up for ThunderCall® | The Call Before the Storm®</p>
                <Form>
                    <Row className="mb-3">
                        <TextComponent name="Email" type="email" onUpdate={updateEmailAddress} small={12} medium={6}/>
                        <TextComponent name="Phone (10 Digits required)" type="phone" onUpdate={updatePhoneNumber} small={12} medium={6}/>
                    </Row>
                    <Row className="mb-3">
                        <TextComponent name="First Name" type="text" onUpdate={updateFirstName} small={12} medium={6}/>
                        <TextComponent name="Last Name" type="text" onUpdate={updateLastName} small={12} medium={6}/>
                    </Row>
                    <Row className="mb-3">
                        <TextComponent name="Street Address (Do not include appt or unit#)" type="text" onUpdate={updateAddress}/>
                    </Row>
                    <Row className="mb-3">
                        <TextComponent name="City" type="text" onUpdate={updateCity} small={12} medium={6}/>
                        <Form.Group as={Col} controlId="formGridState" className="labels" small={12} medium={6}>
                                <Form.Label>State</Form.Label>
                                <Form.Select defaultValue="AL" onChange={statePicker}>
                                    {globals.usStates.map(e => <option value={e} key={e}>{e}</option>
                                    )}
                                </Form.Select>
                            </Form.Group>
                        <TextComponent name="Zip (5 digits)" type="number" onUpdate={updateZip} small={12} medium={4}/>
                    </Row>
                    <Row className="mb-3">
                        <Form.Label>Select Warnings</Form.Label>
                            <Form.Group className="warnbrd  labels" as={Col} id="formGridTornado" sm={8} md={{span:4, offset: 1}}>
                                <Form.Check type="checkbox" label="Tornado" id="Tornado" onChange={ocTorStatus} />
                            </Form.Group>
                            <Form.Group className="warnbrd labels" as={Col} id="formGridSevereWeather" sm={8} md={{span:4, offset: 2}}>
                                <Form.Check type="checkbox" label="Severe Weather" id="Severe Weather" onChange={ocSevStatus} />
                            </Form.Group>
                    </Row>
                    <Row>
                            <Form.Group className="warnbrd labels" as={Col} id="formGridWinterStorm" sm={8} md={{span:4, offset: 1}}>
                               <Form.Check type="checkbox" label="Winter Storm" id="Winter Storm" onChange={ocWinStatus}/>
                            </Form.Group>
                            <Form.Group className="warnbrd labels" as={Col} id="formGridFlashFlood" sm={8} md={{span:4, offset: 2}}>
                                <Form.Check type="checkbox" label="Flash Flood" id="Flash Flood" onChange={ocFFStatus}/>
                            </Form.Group>
                    </Row>
                        <div>
                            <Button className={isLoading.buttonClasses} variant="primary" type="button" onClick={onSubmit}>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" style={{display:isLoading.spinnerDisplay}}>
                                </Spinner>
                                Submit</Button>
                        </div>
                        <div>
                            <p style={{color: color, display: display}}>{error}</p>
                        </div>
                </Form>
            </div>
            <div className="subSuccess" style={{display: defDisplay.submissionDisplay}}>
                <p>Submission Successful</p>
            </div>
            </>
        );
}

export default Signup;
