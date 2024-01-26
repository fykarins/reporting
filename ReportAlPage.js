import React, { useEffect, useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import { ReportAlTable } from "./ReportAlTable";
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

import Select from "react-select";

export const ReportAlPage = () => {
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
  const [approvalType, setApprovalType] = useState("");
  const [statusAl, setStatusAl] = useState("");
  const [requester, setRequester] = useState("");
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

  // const selectOptions = dataBispar.map((e) => {
  //   return {
  //     value: e.param_status,
  //     label: e.param_status,
  //   };
  // });

  const getValueStatus = (value, options) => {
    const return_value = options.filter((val) => value === val.value);
    return return_value;
  };

  const statusOptions = [
    { value: "A", label: "Approve" },
    { value: "C", label: "Cancel" },
    { value: "W", label: "Wait" },
  ];

  // const handleStatusChange = (e) => {
  //   if (e === null) {
  //     e = undefined;
  //     setStatus("");
  //   } else {
  //     setStatus(e.value);
  //   }
  // };

  const handleSearch = async () => {
    const params = {
      reportType: "ApprovalList",
      Vendor_Code: filterVendorCode,
      Status: statusAl,
      Type: approvalType,
      Requester: requester,
      purch_org: filterPurOrg, //valueNmbr, //parameter pembacaan u/ melakukan permintaan API
      pageNo: 1,
      pageSize: 10,
    };

    //--Validasis--//
    // if (startRequestedAt && endRequestedAt === "") {
    //   return showErrorDialog("Please Select End Date ");
    // }
    // if (endRequestedAt && startRequestedAt === "") {
    //   return showErrorDialog("Please Select Start Date");
    // }
    //-- --//

    try {
      const response = await dispatch(fetchReporting(params));
      console.log(response.payload.data, "payload");
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
        reportType: "ApprovalList",
        Vendor_Code: filterVendorCode,
        Status: statusAl,
        Type: approvalType,
        Requester: requester,
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
      reportType: "ApprovalList",
      Vendor_Code: filterVendorCode,
      Status: statusAl,
      Type: approvalType,
      Requester: requester,
    };
    try {
      const response = await dispatch(fetchFile(params));
      if (response.payload.status === 200) {
        const blob = new Blob([response.payload.data], {
          type: "application/xlsx",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "Report_Approval_List.xlsx";
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
      <CardHeader title="Report Approval List">
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

              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Type </b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Type"
                    onChange={(e) => {
                      setApprovalType(e.target.value);
                    }}
                    value={approvalType}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Status </b>
                </Form.Label>
                <Col sm={6}>
                  <Select
                    type="text"
                    options={statusOptions}
                    placeholder="Select Status"
                    onChange={(e) => setStatusAl(e.value)}
                    onKeyPress={handleKeyPress}
                    value={getValueStatus(statusAl, statusOptions)}
                  />
                </Col>
              </Form.Group>
            </Col>

            {/* Right Row */}
            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b> Requester </b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Requester"
                    onChange={(e) => {
                      setRequester(e.target.value);
                    }}
                    value={requester}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
              {/* {user.purch_org !== null && (
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
              )} */}
                <Button className="btn btn-danger" onClick={handleSearch}>
                  Search
                </Button>
            </Col>
          </Form.Group>
        </div>

        {data && data.reportData && data.reportData.length > 0 && (
          <ReportAlTable
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
