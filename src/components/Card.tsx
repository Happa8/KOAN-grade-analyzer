import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { ComponentProps, ReactNode, VFC } from "react";

type Props = ComponentProps<typeof Box> & {
  children: ReactNode;
  isAccordion?: boolean;
  sectionTitle?: string;
  isDefaultOpen?: boolean;
};

type AccProps = {
  children: ReactNode;
  sectionTitle?: string;
  isDefaultOpen?: boolean;
};

const Acc: VFC<AccProps> = ({
  children,
  sectionTitle = "",
  isDefaultOpen = true,
}) => {
  return (
    <Accordion
      borderColor={"transparent"}
      defaultIndex={isDefaultOpen ? [0] : []}
      allowMultiple
      py={2}
    >
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex={1} textAlign="left">
              {sectionTitle}
            </Box>

            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel overflowX="auto">{children}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

const Card: VFC<Props> = ({
  children,
  isAccordion = true,
  sectionTitle,
  ...props
}) => {
  return (
    <Box
      borderWidth={"1px"}
      borderRadius="md"
      w="100%"
      bgColor={"white"}
      p={isAccordion ? 0 : 4}
      {...props}
    >
      {isAccordion ? (
        <Acc sectionTitle={sectionTitle} isDefaultOpen={props.isDefaultOpen}>
          {children}
        </Acc>
      ) : (
        children
      )}
    </Box>
  );
};

export default Card;
