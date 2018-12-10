import { FormControl } from '@angular/forms';

declare let Web3: any;

export const checkEmail = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }
            const pattern = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$/;
            return pattern.test(control.value) ? null : { 'Email is invalid': true };
        } catch (error) {
            return null;
        }
    };
};

export const checkText = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }
            const pattern = /^[a-zA-Z_-\s]{2,100}$/;
            return pattern.test(control.value) ? null : { 'Input is invalid': true };
        } catch (error) {
            return null;
        }
    };
};

export const checkTimeZone = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }
            const pattern = /^[a-zA-Z_\-\/]{2,50}$/;
            return pattern.test(control.value) ? null : { 'Time zone is invalid': true };
        } catch (error) {
            return null;
        }
    };
};

export const checkPassword = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }
            if (!control.value) {
                return null;
            }
            const pattern = /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))/;
            return pattern.test(control.value) ? null : { 'Password is weak. Use at least 8 characters, one lowercase, one uppercase letter and a number.': true };
        } catch (error) {
            return null;
        }
    };
};

export const comparePasswords = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }
            const password = control['_parent'].controls.password.value;
            if (!password) {
                return null;
            }
            return control.value === password ? null : { 'Passwords do not match': true };
        } catch (error) {
            return null;
        }
    };
};

export const checkJSON = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }
            const value = JSON.parse(control.value);

            if (value instanceof Array) {
                const notObjects = value.every(item => item instanceof Object);

                if (!notObjects) {
                    throw new Error();
                }
            } else if (!(value instanceof Object)) {
                throw new Error();
            }

            return null;
        } catch (error) {
            return { 'JSON is invalid': true };
        }
    };
};

export const checkPrivateKey = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }

            const web3 = new Web3();
            console.log(web3.eth.accounts.privateKeyToAccount(control.value).address);
            return null;
        } catch (e) {
            return { 'Private key is invalid': control.value };
        }
    };
};

export const checkAddress = (allowEmpty = true) => {
    return (control: FormControl) => {
        try {
            if (allowEmpty && !control.value) {
                return null;
            }

            const web3 = new Web3();
            return web3.utils.isAddress(control.value) ? null : { 'Public key is invalid': control.value };
        } catch (e) {
            return { 'Public key is invalid': control.value };
        }
    };
};
