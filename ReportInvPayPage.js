import React, { useEffect, useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import { ReportInvPayTable } from "./ReportInvPayTable";
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

export const ReportInvPayPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectReporting);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const pageNo = useSelector(selectPageNo);
  const pageSize = useSelector(selectPageSize);
  const totalRecord = useSelector(selectTotalRecord);

  // Filter
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [startInvoiceDate, setStartInvoiceDate] = useState("");
  const [endInvoiceDate, setEndInvoiceDate] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [valueNmbr, setValueNmbr] = useState(""); //buat deklarasi state

  const filterVendorCode =
    user.vendor_code === null
      ? vendorCode
      : user.vendor_code.replace("0000", "");
  const filterPurOrg =
    user.purch_org === null ? valueNmbr : user.purch_org;

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
      reportType: "InvoiceVsPayment",
      Vendor_Code: filterVendorCode,
      invoice_number_vendor: invoiceNumber,
      start_Invoice_Date: startInvoiceDate,
      end_Invoice_Date: endInvoiceDate,
      purch_org: filterPurOrg, //valueNmbr, //parameter pembacaan u/ melakukan permintaan API
      pageNo: 1,
      pageSize: 10,
    };

    //--Validasi--//
    if (startInvoiceDate && endInvoiceDate === "") {
      return showErrorDialog("Please Select End Date");
    }
    if (endInvoiceDate && startInvoiceDate === "") {
      return showErrorDialog("Please Select Start Date");
    }
    //-- --//

    try {
      const response = await dispatch(fetchReporting(params));
      if (response.payload.data.status === 200) {
        setOverlayLoading(false);
      } else if (
        response.payload.data.error === "10008" ||
        response.payload.data.error === "10009"
      ) {
        // Corrected the syntax here
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
      } else {
        // Corrected the syntax here
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
        valueNmbr = action.payload.value; // Corrected the syntax here
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
        reportType: "InvoiceVsPayment",
        Vendor_Code: filterVendorCode,
        invoice_number_vendor: invoiceNumber,
        start_Invoice_Date: startInvoiceDate,
        end_Invoice_Date: endInvoiceDate,
        purch_org: filterPurOrg, //valueNmbr, //parameter pembacaan u/ melakukan permintaan API
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
          // Corrected the syntax here
          const action = await showErrorDialog(response.payload.data.message);
          if (action.isConfirmed) await history.push("/logout");
        } else {
          // Corrected the syntax here
          const action = await showErrorDialog(response.payload.data.message);
          if (action.isConfirmed) await history.push("/logout");
          valueNmbr = action.payload.value; // Corrected the syntax here
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
      reportType: "InvoiceVsPayment",
      Vendor_Code: filterVendorCode,
      invoice_number_vendor: invoiceNumber,
      start_Invoice_Date: startInvoiceDate,
      end_Invoice_Date: endInvoiceDate,
      purch_org: filterPurOrg, //valueNmbr, //parameter pembacaan u/ melakukan permintaan API
    };
    try {
      const response = await dispatch(fetchFile(params));
      if (response.payload.status === 200) {
        const blob = new Blob([response.payload.data], {
          type: "application/xlsx",
        });
        // Corrected the syntax here
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "Report_Invoice_vs_Payment.xlsx";
        link.click();
      } else {
        // Corrected the syntax here
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
        valueNmbr = action.payload.value; // Corrected the syntax here
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
      <CardHeader title="Report Invoice vs Payment">
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
              {/* {user.vendor_code === null && (
                <Form.Group as={Row}>
                  <Form.Label column sm={3}>
                    <b>Invoice Number </b>
                  </Form.Label>
                  <Col sm={6}>
                    <Form.Control
                      type="text"
                      onChange={(e) => {
                        setVendorCode(e.target.value);
                      }}
                      value={vendorCode}
                      onKeyPress={handleKeyPress}
                    />
                  </Col>
                </Form.Group>
              )} */}

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
            </Col>

            {/* Right Row */}
            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Invoice Date</b>
                </Form.Label>
                <Col sm={4}>
                  <Form.Control
                    type="date"
                    placeholder="Valid From"
                    sm={6}
                    onChange={(e) => setStartInvoiceDate(e.target.value)}
                    value={startInvoiceDate}
                  />
                </Col>
                <b className="mt-3">To</b>
                <Col sm={4}>
                  <Form.Control
                    type="date"
                    placeholder="Valid To"
                    sm={6}
                    onChange={(e) => setEndInvoiceDate(e.target.value)}
                    value={endInvoiceDate}
                  />
                </Col>
              </Form.Group>
              {user.purch_org !== null && (
                <Form.Group as={Row} className="mt-3">
                  <Form.Label column sm={3}>
                    <b>Purchasing Organization</b>
                  </Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        type="text"
                        placeholder="Purchasing Organization"
                        value={user.purch_org}
                        disabled
                      />
                    </Col>
                </Form.Group>
              )}
              {user.purch_org === null && (
                <Form.Group as={Row} className="mt-3">
                  <Form.Label column sm={3}>
                    <b>Purchasing Organization</b>
                  </Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        type="text"
                        placeholder="Purchasing Organization"
                        onChange={(e) => {
                          setValueNmbr(e.target.value);
                        }}
                        value={valueNmbr}
                        onKeyPress={handleKeyPress}
                      />
                    </Col>
                </Form.Group>
             )}
              <Button className="btn btn-danger" onClick={handleSearch}>
                Search
              </Button>
                {/* <Col sm={3}>
                  <Button
                    className="btn btn-danger"
                    onClick={() => history.push("/masterdata/vendor-create")}
                  >
                    Create
                  </Button>
                </Col> */}
            </Col>
          </Form.Group>
        </div>

        {/* Table */}
        {data && data.reportData && data.reportData.length > 0 && (
          <ReportInvPayTable
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
