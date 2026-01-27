import React, { useState, useMemo, useEffect } from "react";
import {
  isDocumentValid,
  getDaysUntilExpiry,
  getExpiryDateFromData,
} from "../../utils/dateValidation";
import { validateExtractedData } from "../../utils/fieldValidation";

const LabelsList = ({ extractedData }) => {
  useEffect(() => {
    setLabels(Object.keys(extractedData || {}));
    setLabelValues(Object.values(extractedData || {}));
  }, [extractedData]);
  const [labels, setLabels] = useState(Object.keys(extractedData || {}));
  const [labelValues, setLabelValues] = useState(
    Object.values(extractedData || {}),
  );
  const [editIndex, setEditIndex] = useState(null);
  const [editFieldType, setEditFieldType] = useState(null);
  const [editObjectKey, setEditObjectKey] = useState(null);
  const [editSubObjectKey, setEditSubObjectKey] = useState(null);
  const [editArrayIndex, setEditArrayIndex] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  const documentValidity = useMemo(() => {
    const expiryDate = getExpiryDateFromData(extractedData);
    if (!expiryDate) return null;
    const isValid = isDocumentValid(expiryDate);
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    return { isValid, daysUntilExpiry, expiryDate };
  }, [extractedData]);

  const validationWarnings = useMemo(() => {
    return validateExtractedData(extractedData);
  }, [extractedData]);

  const copyToClipboard = async (value, fieldName) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const updateValueIndex = (index, newValue) => {
    setLabelValues((prev) => {
      const updated = [...prev];
      updated[index] = newValue;
      return updated;
    });
  };

  const saveEdit = (
    field_type,
    object_key = null,
    sub_object_key = null,
    array_index = null,
  ) => {
    if (editIndex === null) return;
    if (field_type === 0) {
      updateValueIndex(editIndex, tempValue);
    } else if (field_type === 1) {
      const table = JSON.parse(JSON.stringify(labelValues[editIndex]));
      table[array_index][object_key] = tempValue;
      updateValueIndex(editIndex, table);
    } else if (field_type === 2) {
      const table = JSON.parse(JSON.stringify(labelValues[editIndex]));
      table[object_key][sub_object_key] = tempValue;
      updateValueIndex(editIndex, table);
    } else if (field_type === 3) {
      const obj = JSON.parse(JSON.stringify(labelValues[editIndex]));
      obj[object_key] = tempValue;
      updateValueIndex(editIndex, obj);
    }
    setEditIndex(null);
    setEditObjectKey(null);
    setEditSubObjectKey(null);
    setEditArrayIndex(null);
    setTempValue("");
  };

  const getLabelValue = (
    index,
    field_type,
    object_key = null,
    sub_object_key = null,
    array_index = null,
  ) => {
    if (field_type === 0) return labelValues[index];
    if (field_type === 1) return labelValues[index][array_index][object_key];
    if (field_type === 2) return labelValues[index][object_key][sub_object_key];
    if (field_type === 3) return labelValues[index][object_key];
  };

  const renderEditableValueStr = (
    index,
    field_type,
    is_found = true,
    object_key = null,
    sub_object_key = null,
    array_index = null,
  ) => {
    const initial_value = is_found
      ? getLabelValue(
          index,
          field_type,
          object_key,
          sub_object_key,
          array_index,
        )
      : "NOT_FOUND";
    const fieldName = object_key || sub_object_key || labels[index];
    const isCopied = copiedField === `${fieldName}-${index}-${array_index}`;
    const fieldWarning = validationWarnings.find((w) => w.field === fieldName);

    return (
      <div className='flex flex-col gap-2 p-3 group/field'>
        <div className='flex items-center gap-3'>
          <div
            onDoubleClick={() => {
              setEditIndex(index);
              setEditFieldType(field_type);
              setEditObjectKey(object_key);
              setEditSubObjectKey(sub_object_key);
              setEditArrayIndex(array_index);
              setTempValue(initial_value);
            }}
            className={`
              cursor-pointer text-sm p-3 rounded-xl flex-1 transition-all duration-300
              ${is_found ? "text-white bg-white/5" : "text-[var(--color-signal-red)] bg-[var(--color-signal-red)]/10"}
              ${fieldWarning ? "border border-[var(--color-digital-orange)]/50 shadow-[0_0_15px_rgba(252,127,64,0.1)]" : "border border-white/5 hover:border-[var(--color-electric-blue)]/50"}
              ${is_found ? "font-bold" : "font-medium italic"}
              group-hover/field:bg-white/10
            `}
          >
            {editIndex === index &&
            editFieldType === field_type &&
            editObjectKey === object_key &&
            editSubObjectKey === sub_object_key &&
            editArrayIndex === array_index ? (
              <input
                autoFocus
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() =>
                  saveEdit(field_type, object_key, sub_object_key, array_index)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  saveEdit(field_type, object_key, sub_object_key, array_index)
                }
                className='bg-transparent w-full outline-none text-[var(--color-electric-blue)] font-bold'
              />
            ) : (
              initial_value
            )}
          </div>
          {is_found && initial_value && initial_value !== "NOT_FOUND" && (
            <button
              onClick={() =>
                copyToClipboard(
                  initial_value,
                  `${fieldName}-${index}-${array_index}`,
                )
              }
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border
                ${isCopied ? "bg-green-500 border-green-400 text-white" : "bg-white/5 border-white/10 text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-electric-blue)] hover:border-[var(--color-electric-blue)]"}
              `}
            >
              <i
                className={`pi ${isCopied ? "pi-check" : "pi-copy"} text-xs`}
              ></i>
            </button>
          )}
        </div>
        {fieldWarning && (
          <div className='flex items-center gap-2 px-3 py-2 bg-[var(--color-digital-orange)]/10 border border-[var(--color-digital-orange)]/20 rounded-lg text-[10px] text-[var(--color-digital-orange)] font-bold uppercase tracking-wider'>
            <i className='pi pi-exclamation-triangle'></i>
            <span>{fieldWarning.message}</span>
          </div>
        )}
      </div>
    );
  };

  const renderDynamicTable = (index) => {
    const table = labelValues[index];
    const labelName = labels[index];
    if (table.length === 0)
      return (
        <div className='p-6 text-[var(--color-text-secondary)] text-xs italic uppercase tracking-widest'>
          Empty Data Set
        </div>
      );

    const renderTable = (headers, rows) => (
      <div className='mt-3 bg-black/20 rounded-2xl border border-white/5 overflow-hidden'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-white/5 border-b border-white/5'>
              {headers.map((h) => (
                <th
                  key={h}
                  className='p-4 text-left font-black text-[var(--color-text-secondary)] text-[9px] uppercase tracking-[0.2em]'
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className='border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors'
              >
                {Object.keys(row).map((key) => (
                  <td key={key} className='p-1'>
                    {renderEditableValueStr(
                      index,
                      1,
                      true,
                      key,
                      null,
                      rowIndex,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    if (labelName === "activities")
      return renderTable(["Code", "Activity Name"], table);
    if (labelName === "managers")
      return renderTable(["Name", "Doc No", "Nationality", "Position"], table);
    if (labelName === "partners")
      return renderTable(["Name", "Doc No", "CR No", "Nationality"], table);

    return (
      <div className='space-y-4 p-2'>
        {table.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className='bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-[var(--color-electric-blue)]/30 transition-all'
          >
            <div className='text-[9px] font-black text-[var(--color-electric-blue)] uppercase tracking-[0.3em] mb-4'>
              Entry #{rowIndex + 1}
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {Object.keys(row).map((colKey) => (
                <div key={colKey} className='flex flex-col'>
                  <h4 className='px-3 text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest'>
                    {colKey}
                  </h4>
                  {renderEditableValueStr(
                    index,
                    1,
                    row[colKey] !== "",
                    colKey,
                    null,
                    rowIndex,
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFixedTable = (index) => {
    const values = Object.values(labelValues[index]);
    const keys = Object.keys(labelValues[index]);
    if (values.length === 0)
      return (
        <div className='p-6 text-[var(--color-text-secondary)] text-xs italic uppercase tracking-widest'>
          Empty Data Set
        </div>
      );

    if (typeof values[0] === "string") {
      return (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 p-2'>
          {keys.map((key) => (
            <div key={key} className='flex flex-col'>
              <h4 className='px-3 text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest'>
                {key}
              </h4>
              {renderEditableValueStr(
                index,
                3,
                labelValues[index][key] !== "",
                key,
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className='space-y-6 p-2'>
        {keys.map((rowKey, subIndex) => (
          <div
            key={rowKey}
            className='bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-[var(--color-violet-blue)]/30 transition-all'
          >
            <h4 className='text-[10px] font-black text-[var(--color-violet-blue)] uppercase tracking-[0.3em] mb-6 pb-3 border-b border-white/5'>
              {rowKey}
            </h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {Object.keys(values[subIndex]).map((colKey) => (
                <div key={colKey} className='flex flex-col'>
                  <h5 className='px-3 text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest'>
                    {colKey}
                  </h5>
                  {renderEditableValueStr(
                    index,
                    2,
                    values[subIndex][colKey] !== "",
                    rowKey,
                    colKey,
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='p-8 space-y-10'>
      {validationWarnings.length > 0 && (
        <div className='p-5 rounded-2xl bg-[var(--color-digital-orange)]/5 border border-[var(--color-digital-orange)]/20 shadow-lg shadow-[var(--color-digital-orange)]/5 animate-pulse'>
          <div className='flex items-center gap-4 mb-2'>
            <div className='w-10 h-10 bg-[var(--color-digital-orange)]/20 text-[var(--color-digital-orange)] rounded-xl flex items-center justify-center border border-[var(--color-digital-orange)]/20'>
              <i className='pi pi-shield text-lg'></i>
            </div>
            <div>
              <div className='font-black text-white text-xs uppercase tracking-widest'>
                Integrity Warning
              </div>
              <div className='text-[10px] text-[var(--color-digital-orange)] font-bold uppercase tracking-widest mt-0.5'>
                {validationWarnings.length} Inconsistencies Detected
              </div>
            </div>
          </div>
        </div>
      )}

      {documentValidity && (
        <div
          className={`p-6 rounded-2xl flex items-center gap-5 border shadow-xl transition-all duration-500 ${documentValidity.isValid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[var(--color-signal-red)]/5 border-[var(--color-signal-red)]/20"}`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${documentValidity.isValid ? "bg-emerald-500 shadow-emerald-500/20" : "bg-[var(--color-signal-red)] shadow-[var(--color-signal-red)]/20"}`}
          >
            <i
              className={`pi ${documentValidity.isValid ? "pi-check-circle" : "pi-times-circle"} text-2xl`}
            ></i>
          </div>
          <div>
            <div
              className={`font-black text-sm uppercase tracking-[0.2em] mb-1 ${documentValidity.isValid ? "text-emerald-400" : "text-[var(--color-signal-red)]"}`}
            >
              {documentValidity.isValid
                ? "Document Validated"
                : "Document Expired"}
            </div>
            <div className='text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest'>
              {documentValidity.isValid
                ? `Expires in ${documentValidity.daysUntilExpiry} cycles`
                : `Expired ${Math.abs(documentValidity.daysUntilExpiry)} cycles ago`}
            </div>
          </div>
        </div>
      )}

      <div className='space-y-12'>
        {labels.map((label, index) => (
          <div key={index} className='relative'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-2 h-2 bg-[var(--color-electric-blue)] rounded-full shadow-[0_0_10px_var(--color-electric-blue)]'></div>
              <h3 className='text-[11px] font-black text-white uppercase tracking-[0.4em] m-0'>
                {label.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <div className='flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent'></div>
            </div>
            <div className='bg-white/[0.02] rounded-3xl p-2 border border-white/5 hover:bg-white/[0.04] transition-all duration-500'>
              {typeof labelValues[index] === "string" &&
                renderEditableValueStr(index, 0, labelValues[index] !== "")}
              {typeof labelValues[index] === "object" &&
                !Array.isArray(labelValues[index]) &&
                renderFixedTable(index)}
              {Array.isArray(labelValues[index]) && renderDynamicTable(index)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelsList;
