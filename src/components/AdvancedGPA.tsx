import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  HStack,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import { elementDragControls } from "framer-motion/types/gestures/drag/VisualElementDragControls";
import { useEffect, useState, VFC } from "react";
import { start } from "repl";
import {
  calcCredit,
  calcGPA,
  GradeTableType,
  suspectSubjectGenre,
} from "../home";
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

  const [genreItems, setGenreItems] =
    useState<
      { genreName: string; subGenres: { name: string; isChecked: boolean }[] }[]
    >();

  const [minAndMaxYear, setMinAndMaxYear] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 10000 });

  const handleChangeCheckBox = (
    genreName: string,
    subGenres: string[],
    changeTo: "switch" | boolean = "switch"
  ) => {
    setGenreItems(
      genreItems?.map((elm) => {
        if (elm.genreName == genreName) {
          const newSubGenres: { name: string; isChecked: boolean }[] =
            elm.subGenres.map((e) => {
              if (subGenres.indexOf(e.name) != -1) {
                if (changeTo == "switch") {
                  return { name: e.name, isChecked: !e.isChecked };
                } else {
                  return { name: e.name, isChecked: changeTo };
                }
              } else {
                return e;
              }
            });
          return { genreName: genreName, subGenres: newSubGenres };
        } else {
          return elm;
        }
      })
    );
  };

  useEffect(() => {
    setMinAndMaxYear({
      min: data.reduce((a, b) => (a.acquireYear < b.acquireYear ? a : b))
        .acquireYear,
      max: data.reduce((a, b) => (a.acquireYear > b.acquireYear ? a : b))
        .acquireYear,
    });
    setGenreItems(
      suspectSubjectGenre(data).map((elm) => {
        const subgenres = elm.subjectSubGenre.map((e) => ({
          name: e,
          isChecked: true,
        }));
        return { genreName: elm.subjectGenre, subGenres: subgenres };
      })
    );
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
    <Card isDefaultOpen={false} sectionTitle="条件付きGPA・単位計算">
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
                filterWhiteList:
                  genreItems !== undefined
                    ? {
                        subjectGenre: genreItems
                          .filter((elm) =>
                            elm.subGenres.reduce<boolean>(
                              (sum, elm) => sum && elm.isChecked,
                              true
                            )
                          )
                          .map((elm) => elm.genreName),
                      }
                    : undefined,
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
                filterWhiteList:
                  genreItems !== undefined
                    ? {
                        subjectGenre: genreItems
                          .filter((elm) =>
                            elm.subGenres.reduce<boolean>(
                              (sum, elm) => sum && elm.isChecked,
                              true
                            )
                          )
                          .map((elm) => elm.genreName),
                      }
                    : undefined,
              })}
            </StatNumber>
          </Stat>
        </StatGroup>
        <Divider />
        <Text fontSize={"xs"} fontWeight="bold" color="gray.500">
          期間指定
        </Text>
        <SimpleGrid w="100%" minChildWidth={300} maxW={800} spacing={4}>
          <HStack>
            <Select
              size={"md"}
              defaultValue={minAndMaxYear.min}
              value={dateRange.start.year}
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
              value={dateRange.start.semester}
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
              value={dateRange.end.year}
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
              value={dateRange.end.semester}
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
        <Button
          size={"xs"}
          onClick={() => {
            setDateRange({
              start: { year: minAndMaxYear.min, semester: "春学期" },
              end: { year: minAndMaxYear.max, semester: "冬学期" },
            });
          }}
        >
          全期間にする
        </Button>
        {/* <Divider /> */}
        <Box w="100%" h={4} />
        <Text fontSize={"xs"} fontWeight="bold" color="gray.500">
          科目区分指定
        </Text>
        {genreItems !== undefined ? (
          <SimpleGrid minChildWidth={300} spacing={2} w="100%">
            {genreItems.map((genre) => (
              <Box>
                <Checkbox
                  size={"sm"}
                  key={genre.genreName}
                  isChecked={genre.subGenres.reduce<boolean>(
                    (sum, elm) => sum && elm.isChecked,
                    true
                  )}
                  isIndeterminate={
                    genre.subGenres.reduce<boolean>(
                      (sum, elm) => sum || elm.isChecked,
                      false
                    ) &&
                    !genre.subGenres.reduce<boolean>(
                      (sum, elm) => sum && elm.isChecked,
                      true
                    )
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleChangeCheckBox(
                        genre.genreName,
                        genre.subGenres.map((elm) => elm.name),
                        true
                      );
                    } else {
                      handleChangeCheckBox(
                        genre.genreName,
                        genre.subGenres.map((elm) => elm.name),
                        false
                      );
                    }
                  }}
                >
                  {genre.genreName == "" ? "(区分なし)" : genre.genreName}
                </Checkbox>
                {/* <Stack pl={6} mt={1} spacing={1}>
                  {genre.subGenres.map((elm) => (
                    <Checkbox
                      size="sm"
                      key={elm.name}
                      isChecked={elm.isChecked}
                      onChange={(e) => {
                        handleChangeCheckBox(
                          genre.genreName,
                          [elm.name],
                          e.target.checked
                        );
                      }}
                    >
                      {elm.name}
                    </Checkbox>
                  ))}
                </Stack> */}
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <></>
        )}
      </VStack>
    </Card>
  );
};

export default AdvancedGPA;
