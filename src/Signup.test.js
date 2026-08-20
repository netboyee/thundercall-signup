import {resolveSubmissionOutcome, extractErrorMessage, buildThunderCallPayload, buildThunderCallRequest, buildLegacyRequest, readTurnstileToken} from './Signup';

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

describe('readTurnstileToken', () => {
    test('reads the hidden turnstile response when present', () => {
        document.body.innerHTML = '<input name="cf-turnstile-response" value="token-123" />';

        expect(readTurnstileToken()).toBe('token-123');
    });
});
