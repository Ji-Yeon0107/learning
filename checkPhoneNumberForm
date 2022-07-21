const [shippingDocument, setShippingDocument] = useState({
    phoneNumber:  '',
  });
  const [phoneValue, setPhoneValue] = useState('');


const checkPhoneNumberForm = value => {
    console.log('VALUE', value);
    const inspectIsNum = new RegExp(/^-|[0-9]*$/).test(value);
    const inspectForm = new RegExp(/^\d{3}-\d{4}-\d{4}$/).test(value);
    const inspectStartNum = new RegExp(/^01/).test(value);

    if (inspectIsNum && inspectForm && inspectStartNum) {
      return true;
    } else {
      alert('휴대폰번호를 확인해주세요');
      return false;
    }
  };

const handleTextInputChange = e => {
      //제출하기 전에 number인지, 010-0000-0000형식인지, 글자 길이 체크, 01~로 시작하는지 체크
      const value = e.currentTarget.value;
      let phoneNumberForm = '';
      const inspectPhoneNumber = str => new RegExp(/^[0-9]*$/).test(str);
      if (value?.length === 11) {
        if (!inspectPhoneNumber(e.currentTarget.value)) {
          alert('숫자만 입력해주세요');
          return;
        }

        phoneNumberForm = e.currentTarget.value.replace(
          /(\d{3})(\d{4})(\d{4})/,
          '$1-$2-$3',
        );
        setShippingDocument({
          ...shippingDocument,
          phoneNumber: phoneNumberForm,
        });
        setPhoneValue(phoneNumberForm);

        return;
      }
      if (value?.length > 11) {
        e.currentTarget.value = phoneValue;
      }
    }

    setShippingDocument({
      ...shippingDocument,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };
