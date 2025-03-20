// 将商品数据进行分拣，逻辑为：
// 当子商品有自己的图片，将其抽出单独作为一项
// 当子商品没有自己图片，仍然留在组商品中
// 当组商品没有子项，过滤掉
export function filterAndTransferProductData(data) {
  const extendParentData = (child, parent) => {
    return {
      costPriceRMB: child.costPriceRMB || parent.costPriceRMB,
      nameCn: child.nameCn || parent.nameCn,
      costSuppliersLinkPricesRMB:
        child.costSuppliersLinkPricesRMB?.length ||
        parent.costSuppliersLinkPricesRMB,
      priceLinkSuppliers: child.priceLinkSuppliers,
    };
  };

  return (
    data
      .flatMap((item) => {
        // 非组合商品直接标记 __type 0
        if (!item.isGroup) {
          return [{ ...item, __type: 0 }];
        }

        // 组合商品但无子项，过滤掉
        if (item.children.length === 0) {
          return [];
        }

        // 分离有图片和无图片的子项
        const childrenWithImages = item.children.filter(
          (child) => child.images && child.images.length > 0
        );
        const childrenWithoutImages = item.children.filter(
          (child) => !child.images || child.images.length === 0
        );

        // 所有子项无图片，父标记 __type 1
        if (childrenWithImages.length === 0) {
          return [{ ...item, __type: 1 }];
        }

        // 所有子项有图片，拆分并过滤父
        if (childrenWithoutImages.length === 0) {
          return childrenWithImages.map((child) => ({
            ...child,
            __type: 0,
            ...extendParentData(child, item),
          }));
        }

        // 部分子项有图片，拆分后保留父并更新其子项
        const updatedParent = {
          ...item,
          children: childrenWithoutImages,
          __type: 1,
        };
        const splitChildren = childrenWithImages.map((child) => ({
          ...child,
          __type: 0,
          ...extendParentData(child, item),
        }));

        // 进行商品数据过滤，只留下生成订单需要的数据
        return [updatedParent, ...splitChildren];
      })
      // 只将有用的字段带出来
      .map((product) => ({
        id: product.id,
        nameCn: product.nameCn,
        sku: product.sku,
        stock: product.stock,
        costPriceRMB: product.costPriceRMB,
        children: product.children,
        costSuppliersLinkPricesRMB: product.costSuppliersLinkPricesRMB,
        priceLinkSuppliers: product.priceLinkSuppliers,
        parentGroupId: product.parentGroupId,
        __type: product.__type,
        images: product.images.map((img) => img.url),
      }))
  );
}

export function productDataAddCountDfs(productList = [], countMap = {}) {

  for (let i = productList.length - 1; i >= 0; i--) {
    const node = productList[i];
    // 递归处理子节点（处理后子节点可能被删除）
    if (node.children) productDataAddCountDfs(node.children, countMap);
    
    // 添加 count 字段
    if (countMap[node.id] !== undefined) node.count = countMap[node.id];
    
    // 判断是否需要删除当前节点
    const hasCount = node.count !== undefined;
    const hasValidChildren = node.children?.length > 0;

    if (!hasCount && !hasValidChildren) {
        productList.splice(i, 1); // 删除当前节点
    }
  }
  return productList;
}
