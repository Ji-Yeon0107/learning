import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Fab,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';

import { parseStringToPrice } from 'utils';

import { getProductDetailById, setProductOptionDetail } from 'store/mall';
import { setOrderDetail } from 'store/order';
import {
  setOrderItemsInfo,
  setOrderCartItems,
  setOrderItemsInfoForDisplay,
  popShopItemFromBasketAPI,
  getAllCartItems,
} from 'store/cart';

import PageLayout from 'components/layout/PageLayout';
import Container from 'components/atom/Container';
import ScrollTop from 'components/ScrollTop';
import Divider from 'components/Divider';
import CartItemOption from './CartItemOption';
import { CountController } from 'components/product';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItemsInfo = useSelector(state => state?.cart.cartItems);
  const cartUpdated = useSelector(state => state?.cart.cartUpdate);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialCartItemsInfo, setInitialCartItemsInfo] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allCheckButtonOn, setAllCheckButtonOn] = useState(true);

  // server에서 받아온 cart itmes를 복사
  useEffect(() => {
    const newArray = cartItemsInfo.map(item => ({
      ...item,
    }));

    setInitialCartItemsInfo(newArray);
  }, [cartItemsInfo]);

  // 선택된 item
  useEffect(() => {
    const selected = initialCartItemsInfo?.filter(item => item.selected);
    setSelectedItems(selected);
  }, [initialCartItemsInfo, cartItemsInfo]);

  // 상품주문page 상품 초기화
  useEffect(() => {
    dispatch(setOrderItemsInfoForDisplay([]));
  }, []);

  useEffect(() => {
    dispatch(getAllCartItems());
  }, [dispatch, cartUpdated]);

  const onClickCheckAll = e => {
    const newArray = initialCartItemsInfo?.map(item => ({ ...item }));
    const newCartItemsInfo = newArray.map(item => {
      if (e.target.checked) {
        return {
          ...item,
          selected: true,
        };
      }
      if (!e.target.checked) {
        return {
          ...item,
          selected: false,
        };
      }
    });
    setInitialCartItemsInfo(newCartItemsInfo);
  };

  const orderMultiple = () => {
    // 선택상품이 없을 때
    if (selectedItems.length === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }
    // 장바구니 선택 상품이 1개일때
    if (selectedItems.length === 1) {
      orderOne(selectedItems[0]);
      return;
    }
    dispatch(setOrderCartItems(true));
    dispatch(setOrderItemsInfo(makeOrderItemList()));
    const orderDetail = {
      hasInfo: true,
      itemName: `${selectedItems[0].itemName} 외 ${
        selectedItems?.length - 1
      }건`,
      amount: calcSum('product'),
      shippingFee: calcSum('delivery'),
      additionalFee: calcSum('onlyAdditionalOption'),
    };
    dispatch(setOrderDetail(orderDetail));
    dispatch(setOrderItemsInfoForDisplay(selectedItems));
    navigate('/payment');
  };

  const orderOne = item => {
    dispatch(setOrderCartItems(true));
    dispatch(setOrderItemsInfo([item.itemOrderId]));
    dispatch(setOrderItemsInfoForDisplay([item]));

    getProductDetail(item.itemId);
    const optionData = item.itemOptionInfo?.map(option => ({
      optionId: option.optionId,
      type: option.optionType,
      name: option.optionName,
      price:
        option.optionType === 'additional'
          ? option.optionPrice
          : option.itemPrice,
      qty: option.optionCount,
    }));
    const optionDataForOrderDetail = optionData?.map(option => ({
      optionId: option.optionId,
      optionCount: option.qty,
    }));
    const itemData = [
      {
        type: item.textOption ? 'text' : 'none',
        qty: item.itemCount,
        textOption: item.textOption ? item.textOption : '',
      },
    ];

    if (item.itemOptionInfo.length !== 0)
      dispatch(setProductOptionDetail(optionData));
    if (item.itemOptionInfo.length === 0)
      dispatch(setProductOptionDetail(itemData));

    const orderDetail = {
      hasInfo: true,
      itemId: item.itemId,
      itemName: item.itemName,
      itemCount: item.itemCount,
      optionToOrderItems: optionDataForOrderDetail,
      textOption: item.textOption,
      name: item.itemName,
      amount: item.itemPrice + calcOptionPrice(item),
      shippingFee: item.orderDeliveryPrice,
      additionalFee: calcOptionPrice(item),
    };
    dispatch(setOrderDetail(orderDetail));
    navigate('/payment');
  };

  const calcOptionPrice = item => {
    let sum = 0;
    if (item.itemOptionInfo?.length === 0) return 0;
    const optionPrice = item.itemOptionInfo?.map(
      option => option.optionPrice * option.optionCount,
    );
    optionPrice.forEach(price => {
      sum += price;
    });
    return sum;
  };

  const makeOrderItemList = () => {
    const orderItemList = selectedItems?.map(item => item.itemOrderId);
    return orderItemList;
  };

  const getProductDetail = async itemId => {
    const res = dispatch(getProductDetailById({ itemId: itemId }));
    const productDetail = res.payload;
    if (productDetail) setLoading(false);
  };
  const moveToItemDetail = e => {
    navigate('/product/' + e.currentTarget.id);
  };
  const deleteCartItem = async item => {
    const data = { itemId: item.itemId };
    dispatch(popShopItemFromBasketAPI(data));
  };
  const deleteMultipleCartItems = async () => {
    const data = selectedItems.map(item => ({ itemId: item.itemId }));
    data.forEach(item => dispatch(popShopItemFromBasketAPI(item)));
  };
  const calcSum = data => {
    let sum = 0;
    // 상품금액 + 추가옵션금액 + 배송비
    if (data === 'total') {
      selectedItems?.forEach(item => {
        if (item.selected) sum += item.totalOrderPrice;
      });
    }
    // 배송비
    if (data === 'delivery') {
      selectedItems?.forEach(item => {
        if (item.selected) sum += item.orderDeliveryPrice;
      });
    }
    // 상품금액
    if (data === 'product') {
      selectedItems?.forEach(item => {
        if (item.selected)
          sum += item.totalOrderPrice - item.orderDeliveryPrice;
      });
    }
    // 추가옵션금액
    if (data === 'onlyAdditionalOption') {
      selectedItems?.forEach(item => {
        if (item.selected) {
          sum += calcOptionPrice(item);
        }
      });
    }
    return sum;
  };
  return (
    <PageLayout title="장바구니">
      <Grid
        container
        justifyContent="space-between"
        pl={1}
        pr={1}
        sx={{
          position: 'sticky',
          top: '47px',
          zIndex: 10,
          backgroundColor: '#fff',
          paddingTop: 1,
          paddingBottom: 0.5,
          alignItems: 'center',
        }}
      >
        {/* checkbox */}
        <Grid item>
          <FormControlLabel
            label="전체선택"
            value="all"
            control={
              <Checkbox
                checked={initialCartItemsInfo?.length === selectedItems?.length}
                onChange={onClickCheckAll}
                onClick={() => setAllCheckButtonOn(prev => !prev)}
              />
            }
          />
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            sx={{ height: '80%' }}
            onClick={deleteMultipleCartItems}
          >
            선택 삭제
          </Button>
        </Grid>
        {/* end - checkbox */}
      </Grid>
      <Divider />
      <Container>
        {loading || (
          <CartItemOption open={open} onClose={() => setOpen(false)} />
        )}
        {cartItemsInfo.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              pt: 8,
              textAlign: 'center',
            }}
          >
            장바구니에 담긴 상품이 없습니다. <br />
            장바구니에 상품을 담아주세요.
          </Box>
        )}
        {initialCartItemsInfo?.map((item, i) => (
          <Box key={item.itemId * i} p={2}>
            <Grid container sx={{ gap: '5px' }}>
              <CheckboxControl
                id={i}
                item={item}
                initialCartItemsInfo={initialCartItemsInfo}
                setInitialCartItemsInfo={setInitialCartItemsInfo}
                allCheckButtonOn={allCheckButtonOn}
                setAllCheckButtonOn={setAllCheckButtonOn}
                selectedItems={selectedItems}
              />
              <Grid item sx={{ flex: 7 }}>
                <Grid container mb={1}>
                  <Grid
                    item
                    xs={3}
                    marginRight={1}
                    id={item.itemId}
                    onClick={e => moveToItemDetail(e)}
                  >
                    <img
                      src={item.thumbNail}
                      alt={item.itemId}
                      style={{ width: '100%', borderRadius: '4px' }}
                    />
                  </Grid>
                  <Grid item xs={8.6}>
                    <Typography
                      fontSize="0.9rem"
                      id={item.itemId}
                      onClick={e => moveToItemDetail(e)}
                    >
                      {item.itemName}
                    </Typography>
                    <Typography fontSize="0.9rem" fontWeight="bold">
                      {parseStringToPrice(item.itemPricePerCount)}원
                    </Typography>
                  </Grid>
                </Grid>
                <Grid sx={{ marginBottom: 1.5 }}>
                  {item.itemOptionInfo?.map(option => (
                    <Box
                      key={option.optionId}
                      sx={{
                        display: 'flex',
                        width: 1,
                        mb: 0.5,
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <Typography
                        fontSize="0.9rem"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        {option.optionName}
                        {option.optionPrice !== 0 &&
                          `  /  ${parseStringToPrice(option.optionPrice)}원 `}
                        / {option.optionCount}개{' '}
                        {option.optionPrice !== 0 &&
                          `: ${calcOptionPrice(item)}원`}
                      </Typography>
                    </Box>
                  ))}
                  {item.itemOptionInfo?.length === 0 && !item.textOption && (
                    <Box
                      sx={{
                        display: 'flex',
                        width: 1,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 14px',
                        backgroundColor: 'grey.50',
                        fontSize: '0.9rem',
                      }}
                    >
                      <Grid>상품주문수량</Grid>
                      <Grid>
                        {item.itemCount}개
                        {/* <CountController currentOption={item} /> */}
                      </Grid>
                    </Box>
                  )}
                  {item.textOption && (
                    <Box
                      sx={{
                        display: 'flex',
                        width: 1,
                        mb: 0.5,
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <Typography
                        fontSize="0.9rem"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        옵션 : {item.textOption}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Box
                  sx={{
                    paddingBottom: 1.5,
                  }}
                >
                  <Grid container justifyContent="space-between">
                    <Grid item sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                      상품금액
                    </Grid>
                    <Grid item sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {parseStringToPrice(item.itemPrice)}원
                    </Grid>
                  </Grid>
                  <Grid container justifyContent="space-between">
                    <Grid item sx={{ fontSize: '0.9rem', color: 'grey.500' }}>
                      배송비
                    </Grid>
                    <Grid item sx={{ fontSize: '0.9rem' }}>
                      {item.orderDeliveryPrice === 0
                        ? '무료'
                        : `${parseStringToPrice(item.orderDeliveryPrice)}원`}
                    </Grid>
                  </Grid>
                  <Grid container justifyContent="space-between">
                    <Grid item sx={{ fontSize: '0.9rem' }}>
                      합계금액
                    </Grid>
                    <Grid item sx={{ fontSize: '0.9rem' }}>
                      {parseStringToPrice(item.totalOrderPrice)}원
                    </Grid>
                  </Grid>
                </Box>
                <Divider sx={{ borderColor: 'grey.100' }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 0.4,
                    paddingTop: 1.5,
                  }}
                >
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      height: '31px',
                      borderColor: 'grey.300',
                      color: 'common.black',
                    }}
                    onClick={() => deleteCartItem(item)}
                  >
                    삭제
                  </Button>
                  {/* {(item?.itemOptionInfo?.length !== 0 || item.textOption) && (
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: '31px',
                        borderColor: 'grey.300',
                        color: 'common.black',
                      }}
                      onClick={() => {
                        setOpen(true);
                        getProductDetail(item.itemId);
                      }}
                    >
                      옵션수정
                    </Button>
                  )} */}
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ height: '31px', fontWeight: 'bold' }}
                    onClick={() => orderOne(item)}
                  >
                    주문하기
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ marginTop: 2.5 }}>
              <Divider />
            </Box>
          </Box>
        ))}
      </Container>
      {cartItemsInfo.length !== 0 && (
        <>
          <Box p={2} pb={0}>
            <Grid container justifyContent="space-between">
              <Grid item>총 선택상품금액</Grid>
              <Grid item>{parseStringToPrice(calcSum('product'))}원</Grid>
            </Grid>
            <Grid container justifyContent="space-between">
              <Grid item>총 배송비</Grid>
              <Grid item>{parseStringToPrice(calcSum('delivery'))}원</Grid>
            </Grid>
          </Box>
          <Box
            p={2}
            pt={0.5}
            sx={{ position: 'sticky', bottom: '70px', backgroundColor: '#fff' }}
          >
            <Grid container mt={1} justifyContent="space-between">
              <Grid item sx={{ fontWeight: 'bold' }}>
                총 주문금액
              </Grid>
              <Grid item sx={{ fontWeight: 'bold' }}>
                {parseStringToPrice(calcSum('total'))}원
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              sx={{ marginTop: 2 }}
              onClick={orderMultiple}
            >
              {selectedItems?.length}건 주문하기
            </Button>
          </Box>
        </>
      )}

      <ScrollTop customization>
        <Box
          sx={{ backgroundColor: 'grey.50', width: 1, height: '50px', py: 2 }}
        >
          <Button
            fullWidth
            variant="outlined"
            sx={{
              backgroundColor: '#fff',
              '& .MuiButtonBase-root-MuiFab-root:hover': {
                backgroundColor: 'red',
              },
            }}
          >
            맨 위로
          </Button>
        </Box>
      </ScrollTop>
    </PageLayout>
  );
}

const CheckboxControl = ({
  id,
  item,
  initialCartItemsInfo,
  setInitialCartItemsInfo,
  allCheckButtonOn,
  setAllCheckButtonOn,
  selectedItems,
}) => {
  useEffect(() => {
    hanldeCheckAllCheckButtonOn();
  }, [selectedItems]);

  const handleCheck = e => {
    const newArray = initialCartItemsInfo.map(data => {
      if (item.itemId === data.itemId) {
        data.selected = !item.selected;
      }
      return data;
    });

    // const newInits = [...initialCartItemsInfo];

    // const value = [
    //   ...newInits,
    //   { ...newInits[e.target.id], selected: !newInit[e.target.id].selected },
    // ];

    setInitialCartItemsInfo(newArray);

    // e.stopPropagation();
    // if (item.selected) {
    //   item.selected = false;
    // } else {
    //   item.selected = true;
    // }
    // item.selected = !item.selected;
    // setUpdated(prev => !prev);
  };

  const hanldeCheckAllCheckButtonOn = () => {
    if (initialCartItemsInfo?.length === selectedItems?.length) {
      setAllCheckButtonOn(true);
    } else {
      setAllCheckButtonOn(false);
    }
  };

  const handleChangeCheckbox = e => {
    console.log(e.target.checked);

    const value = {
      ...initialCartItemsInfo[e.target.id],
      selected: e.target.checked,
    };

    setInitialCartItemsInfo(prev => [...prev, value]);
  };

  return (
    <Grid item sx={{ flex: 1 }}>
      <Checkbox
        value={item.itemId}
        label={item.itemName}
        checked={allCheckButtonOn || item.selected}
        inputProps={{ 'aria-label': 'product' }}
        sx={{ padding: 0 }}
        onChange={handleCheck}
      />
    </Grid>
  );
};
