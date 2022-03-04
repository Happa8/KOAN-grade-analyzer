import {
  Box,
  Divider,
  Flex,
  HStack,
  Select,
  SimpleGrid,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, VFC } from "react";
import { calcCredit, calcGPA, GradeTableType } from "../home";
import Card from "./Card";

type Props = {
  data: GradeTableType[];
};

const range = (start: number, end: number): number[] =>
  [...Array(end + 1).keys()].slice(start);

const AdvancedGPA: VFC<Props> = ({ data }) => {
  const [dateRange, setDateRange] = useState<{
    start: { year: number; semester: string };
    end: { year: number; semester: string };
  }>({
    start: { year: 0, semester: "春学期" },
    end: { year: 10000, semester: "冬学期" },
  });

  const [minAndMaxYear, setMinAndMaxYear] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 10000 });

  useEffect(() => {
    setMinAndMaxYear({
      min: data.reduce((a, b) => (a.acquireYear < b.acquireYear ? a : b))
        .acquireYear,
      max: data.reduce((a, b) => (a.acquireYear > b.acquireYear ? a : b))
        .acquireYear,
    });
  }, [data]);
  useEffect(() => {
    setDateRange({
      start: {
        year: minAndMaxYear.min,
        semester: "春学期",
      },
      end: {
        year: minAndMaxYear.max,
        semester: "冬学期",
      },
    });
  }, [minAndMaxYear]);

  return (
    <Card isDefaultOpen={false} sectionTitle="GPA計算">
      <VStack align={"start"}>
        <Text fontSize={"sm"} color="gray.500">
          特定の条件下でのGPA/単位を計算することができます。
        </Text>
        <Divider />
        <StatGroup w="100%">
          <Stat>
            <StatLabel>GPA</StatLabel>
            <StatNumber>
              {calcGPA({
                gradeData: data,
                startYearSemester: dateRange.start,
                endYearSemester: dateRange.end,
              })}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>修得済み単位数</StatLabel>
            <StatNumber>
              {calcCredit({
                gradeData: data,
                startYearSemester: dateRange.start,
                endYearSemester: dateRange.end,
              })}
            </StatNumber>
          </Stat>
        </StatGroup>
        <Divider />
        <Text fontSize={"xs"} fontWeight="bold" color="gray.500">
          期間指定
        </Text>
        <SimpleGrid w="100%" minChildWidth={300} maxW={650} spacing={4}>
          <HStack>
            <Select
              size={"md"}
              defaultValue={minAndMaxYear.min}
              w={100}
              onChange={(e) => {
                setDateRange({
                  ...dateRange,
                  start: {
                    year: parseInt(e.target.value),
                    semester: dateRange.start.semester,
                  },
                });
              }}
            >
              {range(minAndMaxYear.min, minAndMaxYear.max).map((elm) => (
                <option value={elm} key={elm}>
                  {elm}
                </option>
              ))}
            </Select>
            <Text fontSize="sm">年</Text>
            <Select
              size={"md"}
              defaultValue={"春学期"}
              w={120}
              onChange={(e) => {
                setDateRange({
                  ...dateRange,
                  start: {
                    year: dateRange.start.year,
                    semester: e.target.value,
                  },
                });
              }}
            >
              <option value="春学期">春学期</option>
              <option value="夏学期">夏学期</option>
              <option value="秋学期">秋学期</option>
              <option value="冬学期">冬学期</option>
            </Select>
            <Text w={20} fontSize="sm">
              から
            </Text>
          </HStack>
          <HStack>
            <Select
              size={"md"}
              defaultValue={minAndMaxYear.max}
              w={100}
              onChange={(e) => {
                setDateRange({
                  ...dateRange,
                  end: {
                    year: parseInt(e.target.value),
                    semester: dateRange.end.semester,
                  },
                });
              }}
            >
              {range(minAndMaxYear.min, minAndMaxYear.max)
                .reverse()
                .map((elm) => (
                  <option value={elm} key={elm}>
                    {elm}
                  </option>
                ))}
            </Select>
            <Text fontSize="sm">年</Text>
            <Select
              size={"md"}
              defaultValue={"冬学期"}
              w={120}
              onChange={(e) => {
                setDateRange({
                  ...dateRange,
                  end: {
                    year: dateRange.end.year,
                    semester: e.target.value,
                  },
                });
              }}
            >
              <option value="春学期">春学期</option>
              <option value="夏学期">夏学期</option>
              <option value="秋学期">秋学期</option>
              <option value="冬学期">冬学期</option>
            </Select>
            <Text w={20} fontSize="sm">
              まで
            </Text>
          </HStack>
        </SimpleGrid>
      </VStack>
    </Card>
  );
};

export default AdvancedGPA;
