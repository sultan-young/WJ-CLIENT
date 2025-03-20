import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import dayjs from "dayjs";
import { Button, Row, Col, Form, DatePicker } from "antd";
import "./index.less";
import PreviewOrder from "../PreviewOrder";

const ExportOrder = forwardRef(
  ({ supplierForm, orderForm, defaultSelectShipDate }, ref) => {
    const { supplier: supplierId } = supplierForm.current
      ? // eslint-disable-next-line no-unsafe-optional-chaining
        supplierForm?.current?.getFieldValue()
      : "";
    const orderList = orderForm.current ? orderForm.current.getValues() : [];
    // console.log('orderList', orderList)
    const [form] = Form.useForm();
    const shippingDate = Form.useWatch("shippingDate", form);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getOrderSetting: () => {
        return form.getFieldsValue();
      },
    }));

    useEffect(() => {
      // 将默认时间回填
      if (defaultSelectShipDate) {
        form.setFieldValue("shippingDate", dayjs(defaultSelectShipDate));
      }
    }, []);

    const disabledDate = (current) => {
      // Can not select days before today and today
      return current && current < dayjs().startOf("day");
    };

    return (
      <div className="max-w-3xl mx-auto p-4">
        <Form form={form} layout="vertical">
          <Form.Item
            label="预计发货日期"
            name="shippingDate"
            extra="如无法确定可不填，在创建订单时候仍可修改"
          >
            <DatePicker disabledDate={disabledDate} />
          </Form.Item>
        </Form>

        <PreviewOrder
          shippingDate={shippingDate}
          supplierId={supplierId}
          orderList={orderList}
        />
      </div>
    );
  }
);

export default ExportOrder;
