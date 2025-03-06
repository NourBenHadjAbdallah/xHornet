import React from 'react';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

function CSVTable({ data, selectedRows, setSelectedRows }) {
  if (!data || !Array.isArray(data) || !data.length) {
    return <div>Aucune donnée disponible</div>;
  }

  const handleCheckboxClick = (event, row) => {
    event.stopPropagation();
    setSelectedRows((prevSelected) => {
      const index = prevSelected.indexOf(row);
      if (index === -1) {
        return [...prevSelected, row];
      } else {
        return prevSelected.filter((_, i) => i !== index);
      }
    });
  };

  const handleSelectAllClick = (event) => {
    setSelectedRows(event.target.checked ? [...data] : []);
  };

  const isSelected = (row) => selectedRows.indexOf(row) !== -1;
  const headerKeys = Object.keys(data[0]);

  return (
    <TableContainer className="table-show">
      <Table>
        <TableHead>
          <TableRow key="header" className="row">
            <TableCell>
              <Checkbox
                checked={selectedRows.length === data.length}
                onChange={handleSelectAllClick}
              />
            </TableCell>
            {headerKeys.map((key, index) => (
              <TableCell key={index} style={{ fontWeight: 'bold' }}>
                {key}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              size="small"
              role="checkbox"
              aria-checked={isSelected(item)}
              tabIndex={-1}
              selected={isSelected(item)}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  onClick={(event) => handleCheckboxClick(event, item)}
                  checked={isSelected(item)}
                />
              </TableCell>
              {Object.values(item).map((val, idx) => (
                <TableCell key={idx}>{val}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CSVTable;