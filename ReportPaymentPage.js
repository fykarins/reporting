import React, { useEffect, useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import { ReportPaymentTable } from "./ReportPaymentTable";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  resetData,
  selectReporting,
  selectLoading,
  selectPageNo,
  selectPageSize,
  selectTotalRecord,
  fetchReporting,
  fetchFile,
} from "../po/reportingSlice";
import { LayoutSplashScreen } from "../../../../_metronic/layout";
import { showErrorDialog } from "../../../utility";
import { selectUser } from "../../../modules/Auth/_redux/authRedux";
import LoadingFetchData from "../../../utility/LoadingFetchData";

export const ReportPaymentPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectReporting);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const pageNo = useSelector(selectPageNo);
  const pageSize = useSelector(selectPageSize);
  const totalRecord = useSelector(selectTotalRecord);

  // Filter
  const [vendorCode, setVendorCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [overlayLoading, setOverlayLoading] = useState(false);

  const filterVendorCode =
    user.vendor_code === null
      ? vendorCode
      : user.vendor_code.replace("0000", "");

  useEffect(() => {
    // Reset on first load
    dispatch(resetData());
  }, [dispatch]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    const params = {
      reportType: "payment",
      Vendor_Code: filterVendorCode,
      Vendor_Name: vendorName,
      payment_date: paymentDate,
      invoice_number_sap: invoiceNumber,
      pageNo: 1,
      pageSize: 10,
    };
    try {
      const response = await dispatch(fetchReporting(params));
      if (response.payload.data.status === 200) {
        setOverlayLoading(false);
      } else if (
        response.payload.data.error === "10008" ||
        response.payload.data.error === "10009"
      ) {
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
      } else {
        showErrorDialog(response.payload.data.message);
        setOverlayLoading(false);
      }
    } catch (error) {
      showErrorDialog(error.message);
      setOverlayLoading(false);
    }
  };

  const handleTableChange = async (
    type,
    { page, sizePerPage, sortField, sortOrder, data }
  ) => {
    if (type === "pagination") {
      const params = {
        reportType: "payment",
        Vendor_Code: filterVendorCode,
        Vendor_Name: vendorName,
        payment_date: paymentDate,
        invoice_number_sap: invoiceNumber,
        pageNo: page,
        pageSize: sizePerPage,
      };
      try {
        const response = await dispatch(fetchReporting(params));
        if (response.payload.data.status === 200) {
          setOverlayLoading(false);
        } else if (
          response.payload.data.error === "10008" ||
          response.payload.data.error === "10009"
        ) {
          const action = await showErrorDialog(response.payload.data.message);
          if (action.isConfirmed) await history.push("/logout");
        } else {
          showErrorDialog(response.payload.data.message);
          setOverlayLoading(false);
        }
      } catch (error) {
        showErrorDialog(error.message);
        setOverlayLoading(false);
      }
    } else {
      let result;
      if (sortOrder === "asc") {
        result = data.sort((a, b) => {
          if (a[sortField] > b[sortField]) {
            return 1;
          } else if (b[sortField] > a[sortField]) {
            return -1;
          }
          return 0;
        });
        console.log(result, "asc");
      } else {
        result = data.sort((a, b) => {
          if (a[sortField] > b[sortField]) {
            return -1;
          } else if (b[sortField] > a[sortField]) {
            return 1;
          }
          return 0;
        });
        console.log(result, "desc");
      }
    }
  };

  const handleDownload = async () => {
    const params = {
      reportType: "payment",
      Vendor_Code: filterVendorCode,
      Vendor_Name: vendorName,
      payment_date: paymentDate,
      invoice_number_sap: invoiceNumber,
    };
    try {
      const response = await dispatch(fetchFile(params));
      if (response.payload.status === 200) {
        const blob = new Blob([response.payload.data], {
          type: "application/xlsx",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "Report_Payment.xlsx";
        link.click();
      } else {
        showErrorDialog(response.payload.data.message);
        console.log("else");
      }
    } catch (error) {
      console.log("catch");

      showErrorDialog(error.message);
    }
  };

  return loading ? (
    <LayoutSplashScreen />
  ) : (
    <Card>
      <CardHeader title="Report Payment">
        <CardHeaderToolbar>
          <Button className="btn btn-danger mr-3" onClick={handleDownload}>
            Download Excel
          </Button>
        </CardHeaderToolbar>
      </CardHeader>
      <LoadingFetchData active={overlayLoading} />
      <CardBody>
        {/* Filter */}
        <div className="mb-5">
          <Form.Group as={Row}>
            <Col sm={6}>
              {user.vendor_code !== null && (
                <Form.Group as={Row}>
                  <Form.Label column sm={3}>
                    <b>Vendor</b>
                  </Form.Label>
                  <Col sm={6}>
                    <Form.Control
                      type="text"
                      placeholder="Vendor"
                      value={user.vendor_name}
                      disabled
                    />
                  </Col>
                </Form.Group>
              )}
              {user.vendor_code === null && (
                <Form.Group as={Row}>
                  <Form.Label column sm={3}>
                    <b>Vendor</b>
                  </Form.Label>
                  <Col sm={6}>
                    <Form.Control
                      type="text"
                      placeholder="Vendor"
                      onChange={(e) => {
                        setVendorCode(e.target.value);
                      }}
                      value={vendorCode}
                      onKeyPress={handleKeyPress}
                    />
                  </Col>
                </Form.Group>
              )}
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Vendor Name </b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Vendor Name"
                    onChange={(e) => {
                      setVendorName(e.target.value);
                    }}
                    value={vendorName}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
            </Col>

            {/* Right Row */}
            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Payment Date </b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="date"
                    placeholder="Payment Date"
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                    }}
                    value={paymentDate}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Invoice Number </b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Invoice Number"
                    onChange={(e) => {
                      setInvoiceNumber(e.target.value);
                    }}
                    value={invoiceNumber}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row}>
                <Col sm={3}>
                  <Button className="btn btn-danger" onClick={handleSearch}>
                    Search
                  </Button>
                </Col>
                {/* <Col sm={3}>
                  <Button
                    className="btn btn-danger"
                    onClick={() => history.push("/masterdata/vendor-create")}
                  >
                    Create
                  </Button>
                </Col> */}
              </Form.Group>
            </Col>
          </Form.Group>
        </div>

        {/* Table */}
        {data && data.reportData && data.reportData.length > 0 && (
          <ReportPaymentTable
            data={data.reportData}
            page={pageNo}
            sizePerPage={pageSize}
            totalSize={totalRecord}
            onTableChange={handleTableChange}
            loading={loading}
          />
        )}
      </CardBody>
    </Card>
  );
};