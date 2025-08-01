import React from "react";
import { useTranslation } from "react-i18next";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import { Tag, TagCategory } from "@app/api/models";
import "./tag-table.css";
import { universalComparator } from "@app/utils/utils";
import { ControlTableActionButtons } from "../../ControlTableActionButtons";

export interface TabTableProps {
  tagCategory: TagCategory;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export const TagTable: React.FC<TabTableProps> = ({
  tagCategory,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <Table borders={false} aria-label="Tag table" variant="compact" isNested>
      <Thead noWrap>
        <Tr>
          <Th>{t("terms.tagName")}</Th>
          <Th screenReaderText="row actions" />
        </Tr>
      </Thead>
      <Tbody>
        {(tagCategory.tags || [])
          .sort((a, b) => universalComparator(a.name, b.name))
          .map((tag) => (
            <Tr key={tag.name}>
              <Td>{tag.name}</Td>
              <ControlTableActionButtons
                onEdit={() => onEdit(tag)}
                onDelete={() => onDelete(tag)}
              />
            </Tr>
          ))}
      </Tbody>
    </Table>
  );
};
