const USDTORMB = 7.3;
// listing上架费
const ListingFeeUSD = 0.2;
// 商品交易佣金（商品总售价 * 0.065) 加拿大适用
const getTransactionCommissionFee = (salePrice) => {
  return salePrice * 0.065;
};
// 支付手续费 (订单收入*0.03+0.25USD)
const getPayProcessingFee = (salePrice) => {
  return salePrice * 0.03 + 0.25;
};
// 加拿大监管费用 (订单收入 * 0.015)
const getSupervisionFee = (salePrice) => {
  return salePrice * 0.015;
};

const usd2Rmb = (price) => {
  return +(price * USDTORMB).toFixed(2);
};

const rmb2usd = (price) => {
  return +(price / USDTORMB).toFixed(2);
};

// 计算商品利润
const calculateProductProfitRMB = ({
  salePriceUSD, // 平台销售金额
  costPriceRMB, // 商品成本
  shippingFeeRMB, // 运费
  saleShipPriceUSD, // 平台商品收取的运费
  packagingFeeRMB = 0, // 包装费
}) => {
    const saleTotalPrice = salePriceUSD + saleShipPriceUSD;
  const feeTotalUSD =
    ListingFeeUSD +
    getTransactionCommissionFee(saleTotalPrice) +
    getPayProcessingFee(saleTotalPrice) +
    getSupervisionFee(saleTotalPrice);
  // 销售获得的金额 - 平台所有抽成 - 商品成本 - 商品运费 - 包装费

  return (
    saleTotalPrice * USDTORMB -
    feeTotalUSD * USDTORMB -
    costPriceRMB -
    shippingFeeRMB -
    packagingFeeRMB
  );
};

// 计算毛利率
const calculateGrossProfit = ({
  costPriceRMB, // 商品成本
  salePriceUSD, // 平台销售金额
  shippingFeeRMB, // 运费
  saleShipPriceUSD, // 平台商品收取的运费
  packagingFeeRMB = 0, // 包装费
}) => {
  // (销售收入 - 销售成本) / 销售收入
  const incomeRMB = calculateProductProfitRMB({
    costPriceRMB, // 商品成本
  salePriceUSD, // 平台销售金额
  shippingFeeRMB, // 运费
  saleShipPriceUSD, // 平台商品收取的运费
  packagingFeeRMB, // 包装费
  });
  return incomeRMB / ((salePriceUSD + saleShipPriceUSD) * USDTORMB) * 100;
};

// 计算净利率
const calculateNetProfit = () => {
  return 0;
};

export {
  usd2Rmb,
  rmb2usd,
  calculateGrossProfit,
  calculateNetProfit,
  calculateProductProfitRMB,
};
