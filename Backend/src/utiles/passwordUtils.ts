function validatePassword(password: string): boolean {
    // Legalább 8 karakter, legalább 1 kisbetű, 1 nagybetű, 1 szám, 1 speciális karakter
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

export { validatePassword };
