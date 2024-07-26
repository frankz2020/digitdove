"use client";
import React, { useState } from "react";
import { useTheme } from "@/app/providers/ThemeContext";
import { useFormat } from "@/app/providers/FormatContext";
import StepHeader from "@/app/components/StepHeader";
import UploadSVG from "@/app/assets/upload.svg";
import styled from "styled-components";
import PDFimage from "../../assets/placeholder/pdfFrame.svg";
import XLSXimage from "../../assets/placeholder/xlsxFrame.svg";
import DOCXimage from "../../assets/placeholder/docxFrame.svg";
import CloseIcon from "../../assets/close.svg";
import mammoth from "mammoth";
import { read as XLSXRead, utils as XLSXUtil } from "xlsx";
import { useGlobalContext } from "@/app/providers/GlobalContext";
enum SyncSpaceStep {
  TargetFile,
  AssociatedData,
  NewData,
  Generate,
  ReviewExport,
}

const FileDisplayContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  background-color: ${(props) => props.theme.neutral};
`;

const FileVisualDiv = styled.div<{ dotted: boolean; theme: any }>`
  max-width: 250px;
  min-width: 150px;
  width: 25%;
  height: auto;
  align-items: center;
  border-radius: 8px;
  border: ${(props) =>
    props.dotted
      ? "2px dotted " + props.theme.neutral1000
      : "2px solid " + props.theme.neutral100};
  background-color: ${(props) => props.theme.neutral100} !important;
`;

const getPlaceHolder = (name: string) => {
  if (name.split(".").pop() === "pdf") {
    return <PDFimage />;
  }
  if (name.split(".").pop() === "docx") {
    return <DOCXimage />;
  }
  if (name.split(".").pop() === "xlsx") {
    return <XLSXimage />;
  }
};

const readExcelFile = (file: File, numberOnly: boolean): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSXRead(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSXUtil.sheet_to_json(worksheet, { header: 1 });

      // Flatten the array and filter based on numberOnly
      const flatArray = jsonData
        .flat()
        .filter((value: any) => typeof value === "number")
        .map((value: number) => value.toString());

      resolve(flatArray);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
const SyncSpace = () => {
  const { format } = useFormat();
  const { theme } = useTheme();
  const { backendUrl } = useGlobalContext();
  const [currentStep, setCurrentStep] = useState(SyncSpaceStep.TargetFile);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [targetFileText, setTargetFileText] = useState<string | null>(null);

  const [associatedData, setAssociatedData] = useState<File | null>(null);
  const [associatedDataValue, setAssociatedDataValue] = useState<any[] | null>(
    null
  );

  const [newData, setNewData] = useState<File | null>(null);
  const [newDataValue, setNewDataValue] = useState<any[] | null>(null);

  const sendToBackend = async () => {
    try {
      const response = await fetch(backendUrl + "/ai/mapExcelNumberToWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({
          oldExcelValue: associatedDataValue,
          newExcelValue: newDataValue,
          wordValue: targetFileText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send data to backend");
      }
      const results = response.json();

      console.log("Data sent to backend successfully");
      console.log("Results:", results);
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  return (
    <div className="flex h-100" style={{ height: "100%" }}>
      <div
        className="h-100"
        style={{ width: "30%", backgroundColor: theme.neutral50 }}
      >
        <div className="p-3">
          <div style={{ fontSize: format.displaySM, fontWeight: 400 }}>
            SyncSpace
          </div>
          <div className="text-sm " style={{ color: theme.neutral700 }}>
            Upload documents and generate output
          </div>
        </div>
        <div className="mt-2 mx-2">
          <StepHeader
            order={1}
            name="Target File"
            finished={currentStep > SyncSpaceStep.TargetFile}
            atStage={currentStep == SyncSpaceStep.TargetFile}
            information="Upload your documents here"
          />
          {currentStep == SyncSpaceStep.TargetFile && (
            <UploadButton
              fileType={[".docx"]}
              onClick={async (file: File) => {
                setTargetFile(file);
                setCurrentStep(currentStep + 1);

                try {
                  const arrayBuffer = await file.arrayBuffer();
                  const result = await mammoth.extractRawText({ arrayBuffer });
                  const text = result.value;
                  setTargetFileText(text);
                  // Now you can send the text to your backend
                  //   sendTextToBackend(text);
                } catch (error) {
                  console.error("Error reading .docx file:", error);
                }
              }}
            />
          )}
          {targetFile && (
            <FileDisplayContainer theme={theme}>
              <div className="flex justify-start gap-2">
                <div>{targetFile.name}</div>
                <div> | </div>
                <div>{targetFile.size}</div>
              </div>

              <div>x</div>
            </FileDisplayContainer>
          )}

          <StepHeader
            order={2}
            name="Associated Data"
            finished={currentStep > SyncSpaceStep.AssociatedData}
            atStage={currentStep == SyncSpaceStep.AssociatedData}
            information="Upload your documents here"
          />
          {currentStep == SyncSpaceStep.AssociatedData && (
            <UploadButton
              fileType={[".xlsx"]}
              onClick={async (file: File) => {
                console.log("associatedData", file);
                setAssociatedData(file);
                setCurrentStep(currentStep + 1);
                try {
                  const data = await readExcelFile(file, true);
                  setAssociatedDataValue(data);
                  console.log("Extracted data:", data);
                  // Now you can send the data to your backend
                  // sendToBackend({ type: 'xlsx', content: data });
                } catch (error) {
                  console.error("Error reading .xlsx file:", error);
                }
              }}
            />
          )}
          {associatedData && (
            <FileDisplayContainer theme={theme}>
              <div className="flex justify-start gap-2">
                <div>{associatedData.name}</div>
                <div> | </div>
                <div>{associatedData.size}</div>
              </div>

              <div>x</div>
            </FileDisplayContainer>
          )}

          <StepHeader
            order={3}
            name="New Data"
            finished={currentStep > SyncSpaceStep.NewData}
            atStage={currentStep == SyncSpaceStep.NewData}
            information="Upload your documents here"
          />
          {currentStep == SyncSpaceStep.NewData && (
            <UploadButton
              fileType={[".xlsx"]}
              onClick={async (file: File) => {
                setNewData(file);
                setCurrentStep(currentStep + 1);
                try {
                  const data = await readExcelFile(file, true);
                  console.log("Extracted data:", data);
                  setNewDataValue(data);
                  // Now you can send the data to your backend
                  // sendToBackend({ type: 'xlsx', content: data });
                } catch (error) {
                  console.error("Error reading .xlsx file:", error);
                }
              }}
            />
          )}
          {newData && (
            <FileDisplayContainer theme={theme}>
              <div className="flex justify-start gap-2">
                <div>{newData.name}</div>
                <div> | </div>
                <div>{newData.size}</div>
              </div>

              <div>x</div>
            </FileDisplayContainer>
          )}

          <StepHeader
            order={4}
            name="Generate"
            finished={currentStep > SyncSpaceStep.Generate}
            atStage={currentStep == SyncSpaceStep.Generate}
            information="Upload your documents here"
          />
          {currentStep == SyncSpaceStep.Generate && (
            <div
              className=" items-center flex flex-col justify-center p-5"
              style={{
                backgroundColor: theme.neutral,
                border: "2px solid " + theme.brand500,
                borderBottomLeftRadius: format.roundmd,
                borderBottomRightRadius: format.roundmd,
              }}
            >
              <div
                onClick={async () => {
                  await sendToBackend();
                  setCurrentStep(currentStep + 1);
                }}
              >
                Generate !
              </div>
            </div>
          )}
          <StepHeader
            order={5}
            name="Review & Export"
            finished={currentStep > SyncSpaceStep.ReviewExport}
            atStage={currentStep == SyncSpaceStep.ReviewExport}
            information="Upload your documents here"
          />
          {currentStep == SyncSpaceStep.ReviewExport && (
            <div
              className=" items-center flex flex-col justify-center p-5"
              style={{
                backgroundColor: theme.neutral,
                border: "2px solid " + theme.brand500,
                borderBottomLeftRadius: format.roundmd,
                borderBottomRightRadius: format.roundmd,
              }}
            >
              <div
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                }}
              >
                Export as DOCX
              </div>
            </div>
          )}
        </div>
      </div>

      {/* visual part */}
      {targetFile && (
        <div
          className="ms-3 items-center flex justify-center"
          style={{ width: "70%", height: "100%" }}
        >
          <div className="flex flex-col justify-center">
            <div>
              <FileVisualDiv dotted={true}>
                <div
                  className="p-2"
                  style={{ backgroundColor: theme.neutral300 }}
                >
                  <div>{getPlaceHolder(targetFile.name)}</div>

                  <div
                    style={{ backgroundColor: theme.neutral100 }}
                    className={"p-2 flex justify-between"}
                  >
                    <div className="item-center">{targetFile.name}</div>
                  </div>
                </div>
              </FileVisualDiv>
            </div>

            {associatedData && <div>Arrow up</div>}
            {associatedData && (
              <div>
                <FileVisualDiv theme={theme} dotted={true}>
                  <div
                    className="p-2"
                    style={{ backgroundColor: theme.neutral300 }}
                  >
                    <div>{getPlaceHolder(associatedData.name)}</div>

                    <div
                      style={{ backgroundColor: theme.neutral100 }}
                      className={"p-2 flex justify-between"}
                    >
                      <div className="item-center">{associatedData.name}</div>
                    </div>
                  </div>
                </FileVisualDiv>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div>Arrow to the right</div>
            <span className="block"></span>
          </div>

          <div className="flex flex-col-reverse justify-center">
            {newData && (
              <div>
                <FileVisualDiv theme={theme} dotted={true}>
                  <div
                    className="p-2"
                    style={{ backgroundColor: theme.neutral300 }}
                  >
                    <div>{getPlaceHolder(newData.name)}</div>

                    <div
                      style={{ backgroundColor: theme.neutral100 }}
                      className={"p-2 flex justify-between"}
                    >
                      <div className="item-center">{newData.name}</div>
                    </div>
                  </div>
                </FileVisualDiv>
              </div>
            )}
            {newData && <div>Arrow up</div>}
            {targetFile && associatedData && newData && (
              <div>
                <FileVisualDiv theme={theme} dotted={false}>
                  <div
                    className="p-2"
                    style={{ backgroundColor: theme.neutral300 }}
                  >
                    <div>{getPlaceHolder("new " + targetFile.name)}</div>

                    <div
                      style={{ backgroundColor: theme.neutral100 }}
                      className={"p-2 flex justify-between"}
                    >
                      <div className="item-center">
                        {"new " + targetFile.name}
                      </div>
                    </div>
                  </div>
                </FileVisualDiv>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type UploadButtonProps = {
  onClick: (file: File) => void;
  fileType: string[] | null;
};
const UploadButton = (props: UploadButtonProps) => {
  const { onClick, fileType } = props;
  const { theme } = useTheme();
  const { format } = useFormat();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onClick(file);
    }
  };
  return (
    <div
      className=" items-center flex flex-col justify-center p-5"
      style={{
        backgroundColor: theme.neutral,
        border: "2px dashed " + theme.neutral1000,
        borderBottomLeftRadius: format.roundmd,
        borderBottomRightRadius: format.roundmd,
      }}
    >
      <UploadSVG />
      <div style={{ fontWeight: 700 }}>Drop Files here</div>
      <div style={{ color: theme.neutral700, fontSize: format.textSM }}>
        DOCX Format up to 10MB
      </div>
      <input
        type="file"
        id="fileInput"
        accept={fileType?.toString() ?? ""}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        className="py-2 px-3 m-2"
        onClick={() => document.getElementById("fileInput")?.click()}
        style={{
          backgroundColor: theme.brand500,
          color: theme.neutral,
          borderRadius: format.roundmd,
        }}
      >
        Select File
      </button>
    </div>
  );
};

export default SyncSpace;
