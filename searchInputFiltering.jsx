  // function filterStore() {
  //   let filteredStore = [];
  //   if (selectValue === "all") {
  //     filteredStore = initialStoreData.filter((store, i) => {
  //       const storeWithNoId = { ...store };
  //       delete storeWithNoId.id;
  //       const values = Object.values(storeWithNoId);
  //       const matched = values.filter((value) => {
  //         return value.toString().match(inputValue);
  //       });
  //       return matched.length !== 0;
  //     });
  //   } else {
  //     filteredStore = initialStoreData.filter((store) => {
  //       const matched = store[selectValue].toString().match(inputValue);
  //       return matched !== null;
  //     });
  //   }
  //   setStoreData(filteredStore);
  // }
