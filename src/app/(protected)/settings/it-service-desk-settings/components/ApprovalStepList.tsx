import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Item } from "~/components/cynergy/AvatarMultiCombobox";
import { Stepper } from "~/components/cynergy/Stepper";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { toast } from "~/components/ui/use-toast";
import { Department } from "~/modules/service-hub/types";
import { ValueLabel } from "~/types/common";

import { DepartmentStepData, StepData } from "../constants/interfaces";
import {
  useFetchApprovalStep,
  useMutateApprovalStep,
} from "../hooks/useApprovalStep";
import {
  useFetchDepartment,
  useFetchOfficeDeptValueLabel,
} from "../hooks/useAssignmentRule";
import { ApprovalStepTable } from "./ApprovalStepTable";

type ApprovalStepListProps = {
  user: Item[];
};

export const ApprovalStepList = (props: ApprovalStepListProps) => {
  const { user } = props;

  const { t: configText } = useTranslation("configuration");

  const { data: serviceHubDept } = useFetchDepartment({
    filter: { rules: [{ rules: [] }] },
    page: 1,
    size: 100,
  });
  const {
    data: approvalStep,
    isLoading: approvalStepLoading,
    refetch: _refetchApprovalStepList,
  } = useFetchApprovalStep();
  const { mutateAsync: updateApprovalStep } = useMutateApprovalStep();
  const { data: departments } = useFetchOfficeDeptValueLabel();

  const [tableData, setTableData] = useState<Array<DepartmentStepData>>([]);
  const [stepData, setStepData] = useState<Array<StepData>>([]);
  const [selectedRow, setSelectedRow] = useState<Department>();
  const [currentStep, setCurrentStep] = useState<number>(0);

  // office department data.
  const departmentData = useMemo<Array<ValueLabel>>(() => {
    if (!departments) {
      return [];
    }

    return [{ value: "0", label: configText("serviceHub.general.all") }].concat(
      departments
    );
  }, [configText, departments]);

  const previewData = useMemo<Array<{ label: string }>>(() => {
    const departmentSteps = tableData?.filter(
      (row) => row.shc_id === selectedRow?.shc_id
    )[0];

    const steps = departmentSteps?.step?.map((step) => ({
      label: step.shc_desc,
    }));

    steps?.unshift({ label: configText("serviceHub.general.requester") });
    steps?.push({ label: departmentSteps.shc_desc });

    return steps;
  }, [tableData, configText, selectedRow?.shc_id]);

  const handleAdd = (departmentId: number) => {
    const newData = [...stepData];
    const departmentData = tableData?.filter(
      (row) => row.shc_id === departmentId
    )[0];
    const departmentStepData = stepData?.filter(
      (row) => row.shc_group_id === departmentId
    );

    const newItem = {
      shc_id: new Date().getTime().toString(),
      shc_did: "0",
      shc_dname: "",
      shc_group_id: departmentId,
      shc_group: "",
      shc_seq: departmentStepData.length + 1,
      shc_desc: `${configText("serviceHub.general.step")} ${
        departmentStepData.length + 1
      }`,
      shc_agent: departmentData.shc_agent,
      shc_dis: 1,
      type: "create",
    } as StepData;

    newData.push(newItem);

    setStepData(newData);

    return newItem;
  };

  const handleEdit = (
    serviceHubDeptID: number,
    sequence: number,
    description: string,
    officeDeptID: string,
    agent: Array<string>
  ) => {
    const newData = [...stepData];

    const index = newData.findIndex(
      (item) =>
        item.shc_group_id === serviceHubDeptID && item.shc_seq === sequence
    );

    if (index !== -1) {
      newData[index].shc_desc = description;
      newData[index].shc_did = officeDeptID;
      newData[index].shc_agent = agent;

      if (newData[index].type === undefined) {
        const newItem = { ...newData[index], type: "edit" as const };

        newData.splice(index, 1, newItem);
      }
    }

    setStepData(newData);
  };

  const handleMove = (
    serviceHubDeptID: number,
    movedItems: Array<StepData>
  ) => {
    const newData = [...tableData];

    const index = tableData.findIndex(
      (item) => item.shc_id === serviceHubDeptID
    );

    if (index !== -1) {
      const movedArray = [...movedItems];

      movedArray.forEach((item) => {
        item.type = item.type !== "create" ? "edit" : item.type;
      });

      const newItem = {
        ...newData[index],
        step: movedArray,
      };

      newData.splice(index, 1, newItem);
    }

    setTableData(newData);
  };

  const handleRemove = (departmentId: number, sequence: number) => {
    const newData = [...stepData];

    const index = newData.findIndex(
      (item) => item.shc_group_id === departmentId && item.shc_seq === sequence
    );

    if (index !== -1) {
      newData.splice(index, 1);
    }

    newData.forEach((item) => {
      if (item.shc_group_id === departmentId && item.shc_seq > sequence) {
        item.shc_seq--;
      }
    });

    setStepData(newData);
  };

  // trigered when finihsed to load user setting.
  useEffect(() => {
    const listData = serviceHubDept
      ?.filter((row) => row.shc_dis === 1)
      .map(
        (row) =>
          ({
            shc_id: row.shc_id,
            shc_desc: row.shc_desc,
            shc_agent: row.shc_agent,
            shc_dis: row.shc_dis,
            step: stepData
              ?.filter((step) => step.shc_group_id === row.shc_id)
              ?.sort((a, b) => a.shc_seq - b.shc_seq),
          } as DepartmentStepData)
      );

    setTableData(listData ?? ([] as DepartmentStepData[]));
  }, [serviceHubDept, stepData]);

  useEffect(() => {
    const stepData = approvalStep?.map(
      (row) =>
        ({
          ...row,
          type: undefined,
        } as StepData)
    );

    setStepData(stepData ?? ([] as StepData[]));
  }, [approvalStep]);

  return (
    <>
      <div className="grid grid-cols-5 gap-2 pt-4">
        <ScrollArea className="col-span-4 h-[464px] w-full pr-2">
          <ApprovalStepTable
            data={tableData}
            departments={departmentData}
            user={user}
            isLoading={approvalStepLoading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onMove={handleMove}
            onRemove={handleRemove}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          ></ApprovalStepTable>
        </ScrollArea>
        <div className="h-[458px] rounded border-[1px] p-2">
          <h4 className="pb-4">
            {configText("serviceHub.approvalStep.previewTitle")}
          </h4>
          {!!previewData?.length ? (
            <div className="h-full pb-8">
              <Stepper
                currentStep={currentStep}
                steps={previewData}
                setStep={setCurrentStep}
                orientation={"vertical"}
                variant="circle"
                labelPosition={"bottom"}
                startNumber={0}
              />
            </div>
          ) : (
            <div className="flex h-[85%] items-center justify-center">
              <p>{configText("serviceHub.approvalStep.noSteps")}</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex w-full flex-row items-center justify-center gap-2 p-4">
        <Button
          key={"save"}
          className="flex h-[30px] w-[284px] flex-row items-center justify-center gap-[10px] px-2 py-1"
          onClick={() => {
            const invalidData = stepData.filter(
              (item) => !item.shc_agent.length
            );

            if (!!invalidData.length) {
              toast({
                variant: "warning",
                title: configText(
                  "serviceHub.approvalStep.saveInvaildToastTitle"
                ),
                description: configText(
                  "serviceHub.approvalStep.saveInvaildToastMessage"
                ),
              });

              return;
            }

            const beforeKeys = approvalStep?.map((item) => item.shc_id);
            const afterKeys = stepData.map((item) => item.shc_id);

            updateApprovalStep({
              newItems: stepData.filter((item) => item.type === "create"),
              edittedItems: stepData.filter((item) => item.type === "edit"),
              removedItems:
                approvalStep?.filter(
                  (item) =>
                    beforeKeys?.includes(item.shc_id) &&
                    !afterKeys.includes(item.shc_id)
                ) ?? [],
            });
          }}
        >
          <Save size={"16"} />
          {configText("serviceHub.general.saveBtn")}
        </Button>
      </div>
    </>
  );
};
