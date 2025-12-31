


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 számjegy
};

export {
 generateOTP
}