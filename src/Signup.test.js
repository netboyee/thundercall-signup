import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import axios from 'axios';
import Signup, {
    resolveSubmissionOutcome,
    extractErrorMessage,
    buildThunderCallPayload,
    buildThunderCallRequest,
    buildLegacyRequest,
    buildSelectedWarningTypes,
    isSignupFormReady,
    readTurnstileToken
} from './Signup';

jest.mock('axios');

beforeEach(() => {
    axios.mockReset();
    process.env.REACT_APP_ACCOUNT_ID = '2';
    process.env.REACT_APP_COMPANYID = '691';
    process.env.REACT_APP_LOCATION = '1';
});

describe('resolveSubmissionOutcome', () => {
    test('treats legacy success as a successful submission even if the new api fails', () => {
        const outcome = resolveSubmissionOutcome(
            {status: 'fulfilled', value: {status: 200}},
            {status: 'rejected', reason: new Error('new api down')}
        );

        expect(outcome.succeeded).toBe(true);
        expect(outcome.legacySucceeded).toBe(true);
        expect(outcome.thunderCallSucceeded).toBe(false);
    });

    test('treats new api success as a successful submission even if legacy fails', () => {
        const outcome = resolveSubmissionOutcome(
            {status: 'rejected', reason: new Error('legacy down')},
            {status: 'fulfilled', value: {status: 200}}
        );

        expect(outcome.succeeded).toBe(true);
        expect(outcome.legacySucceeded).toBe(false);
        expect(outcome.thunderCallSucceeded).toBe(true);
    });

    test('returns a useful error when both submissions fail', () => {
        const outcome = resolveSubmissionOutcome(
            {status: 'rejected', reason: {response: {data: {message: 'Record already exists.'}}}},
            {status: 'rejected', reason: new Error('new api down')}
        );

        expect(outcome.succeeded).toBe(false);
        expect(outcome.errorMessage).toBe('Record already exists.');
    });
});

describe('extractErrorMessage', () => {
    test('falls back to the generic submission message', () => {
        expect(extractErrorMessage(undefined)).toBe('Submission failed');
    });
});

describe('request builders', () => {
    test('maps the legacy signup shape into the slim ThunderCall api payload', () => {
        const payload = {
            externalId: 'RD1234567',
            accountId: 2,
            firstName: 'Ernie',
            lastName: 'Lyon',
            title: '',
            emails: [{emailAddress: 'ernie@example.com', emailType: 'Home'}],
            phones: [{phoneNumber: '4073530340', extension: '', phoneType: 'Home'}],
            addresses: [{
                address: '4368 Berry Oak Dr',
                address2: '',
                city: 'Apopka',
                stateProvince: 'FL',
                zipPostalCode: '32712',
                country: 'US',
                addressType: 'Home',
                thundercall: {
                    phoneSetting: {
                        name: 'Home',
                        phoneType: 'Home',
                        email: 0,
                        enableText: false
                    },
                    warningTypes: [0, 2]
                }
            }]
        };

        expect(buildThunderCallPayload(payload)).toEqual({
            externalId: 'RD1234567',
            accountId: 2,
            firstName: 'Ernie',
            lastName: 'Lyon',
            title: '',
            emailAddress: 'ernie@example.com',
            phoneNumber: '4073530340',
            address: {
                line1: '4368 Berry Oak Dr',
                line2: '',
                city: 'Apopka',
                stateCode: 'FL',
                postalCode: '32712'
            },
            warningTypes: [0, 2]
        });
    });

    test('sends the new api submission through the Cloudflare proxy endpoint', () => {
        const payload = {accountId: 2, firstName: 'Ernie'};
        const request = buildThunderCallRequest(payload, 'turnstile-token');

        expect(request.url).toBe('/api/signup');
        expect(JSON.parse(request.data)).toEqual({
            payload,
            turnstileToken: 'turnstile-token'
        });
    });

    test('keeps the legacy signup request on the existing legacy endpoint', () => {
        const payload = {accountId: 2, firstName: 'Ernie'};
        const request = buildLegacyRequest(payload);

        expect(request.url).toMatch(/^https:\/\/dataload\.voloos\.com\/api\/products\//);
        expect(request.headers.Authorization).toMatch(/^Bearer /);
    });
});

describe('form readiness', () => {
    test('requires all required fields and at least one warning', () => {
        expect(isSignupFormReady({
            firstName: 'Pat',
            lastName: 'Smith',
            emailAddress: 'pat@example.com',
            phoneNumber: '4073530340',
            address: '123 Main St',
            city: 'Tyler',
            zip: '75701',
            usState: 'TX',
            warningTypes: []
        })).toBe(false);

        expect(isSignupFormReady({
            firstName: 'Pat',
            lastName: 'Smith',
            emailAddress: 'pat@example.com',
            phoneNumber: '4073530340',
            address: '123 Main St',
            city: 'Tyler',
            zip: '75701',
            usState: 'TX',
            warningTypes: [0]
        })).toBe(true);
    });

    test('maps checkbox state into warning type codes', () => {
        expect(buildSelectedWarningTypes({
            torStatus: true,
            severeStatus: false,
            winStatus: true,
            flashStatus: true
        })).toEqual([0, 3, 1]);
    });
});

describe('signup form', () => {
    const fillRequiredFields = () => {
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'pat@example.com'}});
        fireEvent.change(screen.getByLabelText('Phone (10 Digits required)'), {target: {value: '4073530340'}});
        fireEvent.change(screen.getByLabelText('First Name'), {target: {value: 'Pat'}});
        fireEvent.change(screen.getByLabelText('Last Name'), {target: {value: 'Smith'}});
        fireEvent.change(screen.getByLabelText('Street Address (Do not include appt or unit#)'), {target: {value: '123 Main St'}});
        fireEvent.change(screen.getByLabelText('City'), {target: {value: 'Tyler'}});
        fireEvent.change(screen.getByLabelText('Zip (5 digits)'), {target: {value: '75701'}});
    };

    test('keeps submit disabled until required fields and one warning are selected', () => {
        render(<Signup />);

        const submitButton = screen.getByRole('button', {name: /submit/i});
        expect(submitButton).toBeDisabled();

        fillRequiredFields();
        expect(submitButton).toBeDisabled();

        fireEvent.click(screen.getByLabelText('Tornado'));
        expect(submitButton).toBeEnabled();
    });

    test('disables submit immediately while requests are in flight', async () => {
        const resolvers = [];
        axios.mockImplementation(() => new Promise((resolve) => {
            resolvers.push(resolve);
        }));

        render(<Signup />);

        fillRequiredFields();
        fireEvent.click(screen.getByLabelText('Tornado'));

        const submitButton = screen.getByRole('button', {name: /submit/i});
        expect(submitButton).toBeEnabled();

        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(axios).toHaveBeenCalledTimes(2);

        await act(async () => {
            resolvers.forEach((resolve) => resolve({status: 200, data: {}}));
        });

        await waitFor(() => {
            expect(submitButton).toBeEnabled();
        });
    });
});

describe('readTurnstileToken', () => {
    test('reads the hidden turnstile response when present', () => {
        document.body.innerHTML = '<input name="cf-turnstile-response" value="token-123" />';

        expect(readTurnstileToken()).toBe('token-123');
    });
});
