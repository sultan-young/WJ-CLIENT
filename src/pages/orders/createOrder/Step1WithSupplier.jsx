import { useMemo, forwardRef, useImperativeHandle } from "react";
import { Form, Select } from "antd";
// 选择供应商
const Step1WithSupplier = forwardRef(({ suppliers }, ref) => {
  const supplierOptions = useMemo(() => {
    return suppliers.map((item) => ({ label: item.name, value: item.id }));
  }, [suppliers]);

  return (
    <Form ref={ref} layout="vertical" onFinish={() => {}}>
      <Form.Item
        label="选择供应商"
        name="supplier"
        rules={[{ required: true, message: "请选择供应商" }]}
      >
        <Select showSearch={true} optionFilterProp="label" options={supplierOptions} />
      </Form.Item>
    </Form>
  );
});

export default Step1WithSupplier;
