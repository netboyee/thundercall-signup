import React, {useRef, useState} from 'react';
import {Form, Button, Col, Row, Spinner} from 'react-bootstrap';
import {globals} from './globals';
import {schemas} from './schema';
import TextComponent from './TextComponent';
import axios from 'axios';

export const extractErrorMessage = (error) => {
    return error?.response?.data?.message || error?.message || "Submission failed";
}

export const readTurnstileToken = () => {
    if (typeof document === 'undefined') {
        return "";
    }

    const value = document.querySelector('input[name="cf-turnstile-response"]')?.value;
    return typeof value === 'string' ? value.trim() : "";
}

export const resetTurnstileWidget = () => {
    if (typeof window === 'undefined') {
        return;
    }
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
        window.turnstile.reset();
    }
}

export const resolveSubmissionOutcome = (legacyResult, thunderCallResult) => {
    const legacySucceeded = legacyResult?.status === 'fulfilled';
    const thunderCallSucceeded = thunderCallResult?.status === 'fulfilled';

    return {
        succeeded: legacySucceeded || thunderCallSucceeded,
        legacySucceeded,
        thunderCallSucceeded,
        errorMessage: extractErrorMessage(legacyResult?.reason) || extractErrorMessage(thunderCallResult?.reason)
    };
}

export const buildThunderCallRequest = (payload, turnstileToken) => ({
    method: 'post',
    url: globals.THUNDERCALL_SIGNUP_PROXY_URL,
    headers: {
        'accept': 'application/json, text/plain',
        'Content-Type' : 'application/json'
    },
    data: JSON.stringify({
        payload,
        turnstileToken: turnstileToken || ""
    })
});

export const buildThunderCallPayload = (legacyPayload) => {
    const address = legacyPayload?.addresses?.[0] || {};

    return {
        externalId: legacyPayload?.externalId || "",
        accountId: legacyPayload?.accountId || 0,
        firstName: legacyPayload?.firstName || "",
        lastName: legacyPayload?.lastName || "",
        title: legacyPayload?.title || "",
        emailAddress: legacyPayload?.emails?.[0]?.emailAddress || "",
        phoneNumber: legacyPayload?.phones?.[0]?.phoneNumber || "",
        address: {
            line1: address.address || "",
            line2: address.address2 || "",
            city: address.city || "",
            stateCode: address.stateProvince || "",
            postalCode: address.zipPostalCode || ""
        },
        warningTypes: address?.thundercall?.warningTypes || []
    };
}

export const buildLegacyRequest = (payload) => ({
    method: 'post',
    url: `${globals.LEGACY_API_BASE_URL}/api/products/${globals.LEGACY_API_PRODUCT_ID}/records`,
    headers: {
        'accept': 'application/json, text/plain',
        'Content-Type' : 'application/json',
        'X-ApiCompanyId': globals.LEGACY_API_COMPANY_HEADER,
        'Authorization': globals.LEGACY_API_AUTHORIZATION
    },
    data: JSON.stringify(payload)
});

const trimValue = (value) => typeof value === 'string' ? value.trim() : "";

export const buildSelectedWarningTypes = ({torStatus, severeStatus, winStatus, flashStatus}) => {
    const warningTypes = [];

    if (torStatus) {
        warningTypes.push(0);
    }
    if (severeStatus) {
        warningTypes.push(2);
    }
    if (winStatus) {
        warningTypes.push(3);
    }
    if (flashStatus) {
        warningTypes.push(1);
    }

    return warningTypes;
}

export const isSignupFormReady = ({firstName, lastName, emailAddress, phoneNumber, address, city, zip, usState, warningTypes}) => {
    return trimValue(firstName) !== "" &&
        trimValue(lastName) !== "" &&
        trimValue(emailAddress) !== "" &&
        trimValue(phoneNumber) !== "" &&
        trimValue(address) !== "" &&
        trimValue(city) !== "" &&
        trimValue(zip) !== "" &&
        trimValue(usState) !== "" &&
        Array.isArray(warningTypes) &&
        warningTypes.length > 0;
}

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitLockRef = useRef(false);

    const accountId = Number.parseInt(process.env.REACT_APP_ACCOUNT_ID || "0", 10);
    const companyId = Number.parseInt(process.env.REACT_APP_COMPANYID || "0", 10);
    const locationId = Number.parseInt(process.env.REACT_APP_LOCATION || "0", 10);
    const warningTypes = buildSelectedWarningTypes({torStatus, severeStatus, winStatus, flashStatus});
    const submitDisabled = isSubmitting || !isSignupFormReady({
        firstName,
        lastName,
        emailAddress,
        phoneNumber,
        address,
        city,
        zip,
        usState,
        warningTypes
    });
    const buttonClasses = submitDisabled ? 'sbbtn disabled' : 'sbbtn';
    const spinnerDisplay = isSubmitting ? 'inline-block' : 'none';

    const updateDefaultDisplay = () => {
        setDefaultDisplay(defDisplay => defDisplay = {
            submissionDisplay: 'block',
            defaultDisplay: 'none'
        })
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
        return generateRandomId();
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

    const setPostBody = (nextExternalId, selectedWarningTypes) => {
        schemas.postBody.addresses[0].stateProvince = usState;
        schemas.postBody.locationIds = locationId > 0 ? [locationId] : [];
        schemas.postBody.phones[0].phoneNumber = phoneNumber;
        schemas.postBody.emails[0].emailAddress = emailAddress;
        schemas.postBody.lastName = lastName;
        schemas.postBody.firstName = firstName;
        schemas.postBody.addresses[0].address = address;
        schemas.postBody.addresses[0].city = city;
        schemas.postBody.addresses[0].zipPostalCode = zip;
        schemas.postBody.externalId = nextExternalId;
        schemas.postBody.accountId = accountId;
        schemas.postBody.companyId = companyId;
        schemas.postBody.tcall = true;
        schemas.postBody.addresses[0].thundercall.warningTypes = [...selectedWarningTypes];

        return JSON.parse(JSON.stringify(schemas.postBody));
    }

    const onSubmit = async () => {
        if (submitLockRef.current || submitDisabled)
        {
            return;
        }

        submitLockRef.current = true;
        setIsSubmitting(true);
        setColor('none');
        setError("");
        setDisplay('none');

        const nextExternalId = updateExternalId();
        const payload = setPostBody(nextExternalId, warningTypes);
        const turnstileToken = readTurnstileToken();
        if(!validation(payload))
        {
            submitLockRef.current = false;
            setIsSubmitting(false);
            return;
        }
        try
        {
            const thunderCallPayload = buildThunderCallPayload(payload);
            const [legacyResult, thunderCallResult] = await Promise.allSettled([
                axios(buildLegacyRequest(payload)),
                axios(buildThunderCallRequest(thunderCallPayload, turnstileToken))
            ]);

            const outcome = resolveSubmissionOutcome(legacyResult, thunderCallResult);
            resetTurnstileWidget();

            if (outcome.succeeded)
            {
                if (!outcome.legacySucceeded)
                {
                    console.warn('Legacy signup sync failed after ThunderCall success.', legacyResult.reason);
                }
                if (!outcome.thunderCallSucceeded)
                {
                    console.warn('ThunderCall signup sync failed after legacy success.', thunderCallResult.reason);
                }
                updateDefaultDisplay();
                return;
            }

            console.error('Both signup submissions failed.', {
                legacyError: legacyResult.reason,
                thunderCallError: thunderCallResult.reason
            });

            const message = outcome.errorMessage;
            if(message === "Record already exists.")
            {
                setValidationState(message + ": Please retry submission");
            }
            else
            {
                setValidationState(message);
            }
        }
        finally
        {
            submitLockRef.current = false;
            setIsSubmitting(false);
        }
    }

    const setValidationState = (stringtoshow) => {
        setColor('red');
        setError(stringtoshow);
        setDisplay('inline');
    }

    const validation = (payload) => {
        if(trimValue(payload.firstName) === "")
        {
            setValidationState("First name required");
            return false;
        }
        if(trimValue(payload.lastName) === "")
        {
            setValidationState("Last name required");
            return false;
        }
        if(trimValue(payload.emails[0].emailAddress) === "")
        {
            setValidationState("Email address required");
            return false;
        }
        if(trimValue(payload.phones[0].phoneNumber) === "")
        {
            setValidationState("Phone number required");
            return false;
        }
        if(trimValue(payload.addresses[0].city) === "")
        {
            setValidationState("City required");
            return false;
        }
        if(trimValue(payload.addresses[0].address) === "")
        {
            setValidationState("Address required");
            return false;
        }
        if(trimValue(payload.addresses[0].stateProvince) === "")
        {
            setValidationState("State Required");
            return false;
        }
        if(trimValue(payload.addresses[0].zipPostalCode) === "")
        {
            setValidationState("Zip Code Required");
            return false;
        }
        if(payload.addresses[0].thundercall.warningTypes.length === 0)
        {
            setValidationState("At least one warning must be selected");
            return false;
        }
        if(payload.accountId <= 0 || payload.companyId <= 0 || payload.locationIds.length === 0)
        {
            setValidationState("Signup form is not configured correctly");
            return false;
        }
        return true;
    }
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
                        {globals.TURNSTILE_SITE_KEY !== "" && (
                        <Row className="mt-4 mb-3 justify-content-center">
                            <Col xs="auto">
                                <div
                                    className="cf-turnstile"
                                    data-sitekey={globals.TURNSTILE_SITE_KEY}
                                    data-theme="light"
                                />
                            </Col>
                        </Row>
                            )}
                            <div className="text-center">
                                <Button className={buttonClasses} variant="primary" type="button" onClick={onSubmit} disabled={submitDisabled}>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" style={{display:spinnerDisplay}}>
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
