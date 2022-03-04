import {
  Accordion,
  AccordionItem,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  SimpleGrid,
  HStack,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  VStack,
  MenuDivider,
} from "@chakra-ui/react";
import { useState, VFC } from "react";
import { GradeTableType, gradeToGradePoint } from "../home";
import Card from "./Card";
import SubjectCard from "./SubjectCard";

type Props = {
  data: GradeTableType[];
};

// 四季を数字に変換
const semesterToNumber = (semester: string): number => {
  switch (semester) {
    case "春学期":
      return 1;
    case "夏学期":
      return 2;
    case "秋学期":
      return 3;
    case "冬学期":
      return 4;
    default:
      return 10;
  }
};

const SubjectList: VFC<Props> = ({ data }) => {
  const [displayOrder, setDisplayOrder] = useState<"desc" | "asc">("desc");
  const [orderKey, setOrderKey] = useState<"name" | "grade" | "date" | "genre">(
    "date"
  );
  const [isDisplayF, setIsDisplayF] = useState<boolean>(true);
  return (
    <Card sectionTitle="履修状況一覧">
      {/* <Accordion allowMultiple borderColor={"transparent"} my={2}>
        <AccordionItem>
          <h3>
            <AccordionButton borderBottomWidth="1px">
              <Box flex={1} textAlign="left">
                表示設定
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel>aaa</AccordionPanel>
        </AccordionItem>
      </Accordion> */}
      <VStack my={2} align="end">
        <Menu closeOnSelect={false}>
          <MenuButton as={Button} size="sm">
            表示設定
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              color="gray.700"
              defaultValue={displayOrder}
              onChange={(e) => {
                setDisplayOrder(e as "desc" | "asc");
              }}
              title="並び順"
              type="radio"
            >
              <MenuItemOption value="asc">昇順</MenuItemOption>
              <MenuItemOption value="desc">降順</MenuItemOption>
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup
              color="gray.700"
              defaultValue={orderKey}
              title="ソートキー"
              type="radio"
              onChange={(e) => {
                setOrderKey(e as "name" | "grade" | "date" | "genre");
              }}
            >
              <MenuItemOption value="date">時系列</MenuItemOption>
              <MenuItemOption value="name">科目名</MenuItemOption>
              <MenuItemOption value="genre">区分名</MenuItemOption>
              <MenuItemOption value="grade">評点</MenuItemOption>
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup
              color="gray.700"
              type="checkbox"
              title="その他"
              onChange={(e) => {
                if (e.indexOf("isDisplayF") != -1) {
                  setIsDisplayF(false);
                } else {
                  setIsDisplayF(true);
                }
              }}
            >
              <MenuItemOption value="isDisplayF">
                未修得の科目を非表示
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </VStack>
      <SimpleGrid minChildWidth={300} spacing={4}>
        {data.length === 0 ? (
          <></>
        ) : (
          data
            .filter((elm) => {
              if (isDisplayF) {
                return true;
              } else {
                return elm.grade != ("Ｆ" || "否");
              }
            })
            .sort((a, b) => {
              const o: { m: -1 | 1; p: -1 | 1 } =
                displayOrder == "asc" ? { m: -1, p: 1 } : { m: 1, p: -1 };
              switch (orderKey) {
                case "date":
                  // 時系列ソート
                  if (a.acquireYear !== b.acquireYear) {
                    return a.acquireYear < b.acquireYear ? o.m : o.p;
                  }
                  if (a.acquireSemester !== b.acquireSemester) {
                    return semesterToNumber(a.acquireSemester) <
                      semesterToNumber(b.acquireSemester)
                      ? o.m
                      : o.p;
                  }
                case "genre":
                  // 区分名ソート
                  if (a.subjectGenre !== b.subjectGenre) {
                    return a.subjectGenre < b.subjectGenre ? o.m : o.p;
                  }
                case "grade":
                  // 成績ソート
                  if (a.grade !== b.grade) {
                    return gradeToGradePoint(a.grade) <
                      gradeToGradePoint(b.grade)
                      ? o.m
                      : o.p;
                  }
                case "name":
                  // 科目名ソート
                  if (a.subjectName !== b.subjectName) {
                    return a.subjectName < b.subjectName ? o.m : o.p;
                  }
              }
              // 時系列ソート
              if (a.acquireYear !== b.acquireYear) {
                return a.acquireYear < b.acquireYear ? -1 : 1;
              }
              if (a.acquireSemester !== b.acquireSemester) {
                return semesterToNumber(a.acquireSemester) <
                  semesterToNumber(b.acquireSemester)
                  ? -1
                  : 1;
              }
              // 区分名ソート
              if (a.subjectGenre !== b.subjectGenre) {
                return a.subjectGenre < b.subjectGenre ? -1 : 1;
              }
              // 科目名ソート
              if (a.subjectName !== b.subjectName) {
                return a.subjectName < b.subjectName ? -1 : 1;
              }
              // 成績ソート
              if (a.grade !== b.grade) {
                return gradeToGradePoint(a.grade) > gradeToGradePoint(b.grade)
                  ? -1
                  : 1;
              }
              return 0;
            })
            .map((item) => <SubjectCard gradeData={item} key={item.No} />)
        )}
      </SimpleGrid>
    </Card>
  );
};

export default SubjectList;
