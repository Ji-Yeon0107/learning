function createRandomPassword() {
    // 자동생성 비밀번호에 조합될 문자열
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const passwordLength = 8;
    let randomPassword = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      randomPassword += chars.substring(randomNumber, randomNumber + 1);
    }
    setPasswordValue(randomPassword);
  }
