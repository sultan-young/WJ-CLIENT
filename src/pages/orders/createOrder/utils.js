import { isEmpty } from "lodash";

export class CountPriceService {
  constructor(supplierId) {
    this.supplierId = supplierId;
  }
  // 先获取自身的价格，如果获取不到，去获取父级的价格
  getProductPrice(item, parentProduct) {
    let price = item.costPriceRMB;

    let priceLinkSuppliers = item.priceLinkSuppliers;

    // 如果当前为子元素，且没有自己的priceLinkSuppliers， 则找组上的priceLinkSuppliers
    if (
      isEmpty(priceLinkSuppliers) &&
      !item.isGroup &&
      item.parentGroupId &&
      parentProduct
    ) {
      priceLinkSuppliers = parentProduct.priceLinkSuppliers;
    }

    if (priceLinkSuppliers === 1) {
      price =
        (item.costSuppliersLinkPricesRMB || []).find(
          (priceObj) => priceObj.id === this.supplierId
        )?.price || price;
    }

    // 自身没有价格去继承父商品的价格
    if (!price && item.parentGroupId && parentProduct) {
      price = this.getProductPrice(parentProduct);
    }

    return price;
  }
  getProductTotalPrice(product) {
    // 组商品直接对子商品价格进行计算并累加
    if (product.children?.length) {
      return product.children
        .filter((item) => item.count > 0)
        .reduce((total, current) => {
          total += this.getProductPrice(current, product) * current.count;
          return total;
        }, 0);
    }

    return product.count * this.getProductPrice(product);
  }
}

export const flattenData = (data) =>
  data.flatMap((item) =>
    item.children?.length ? flattenData(item.children) : [item]
  );
