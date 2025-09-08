"use client";

import {
  Heading,
  Text,
  Button,
  Column,
  Row,  
  Card,
  Badge,
  Logo,
  LetterFx,
  Avatar,
  useTheme,
  RevealFx,  
  Media,
  Icon,
  Scroller,
  Line,  
  Carousel,
  TiltFx,
  Flex
} from "@once-ui-system/core";

import Blocked_Road_lab from "./blocked_road_lab";
import { useRef } from "react";


const sections = [
  { id: "hero", label: "Home" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "demo", label: "Demo" },
  { id: "market", label: "Market" },
  { id: "team", label: "Team" },
  { id: "footer", label: "Contact" },
];

export default function Home() {
  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    problem: useRef<HTMLElement>(null),
    solution: useRef<HTMLElement>(null),
    demo: useRef<HTMLElement>(null),
    market: useRef<HTMLElement>(null),
    team: useRef<HTMLElement>(null),
    footer: useRef<HTMLElement>(null),
  };

  // Smooth scroll handler
  const handleNavClick = (id: string) => {
    const ref = sectionRefs[id as keyof typeof sectionRefs];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Column fillWidth center>
      {/* Navigation Bar */}
      <Row
        as="nav"
        fillWidth
        fitHeight
        align="center"
        center
        style={{ justifyContent: "space-between" }}
        paddingY="m"
        paddingX="l"
      >         
        
          <Text>
            <LetterFx 
  speed="medium"
  trigger="instant"
  >
            E C H E L O N
            </LetterFx>
          </Text>


        {/* Menu Bar Items */}
        <Row gap="l" as="ul" style={{ listStyle: "none" }}>
          {sections.map((s) => (
            <li key={s.id}>
              <RevealFx>
              <Button
                variant="secondary"
                style={{ fontWeight: 600, fontSize: 16, borderRadius: 24, transition: "color 0.2s, background 0.2s", background: "transparent" }}
                onClick={() => handleNavClick(s.id)}
              >
                {s.label}
              </Button>
              </RevealFx>
            </li>
          ))}
        </Row>
      </Row>

      {/* Header Text / HERO SECTION */}
      <section ref={sectionRefs.hero} id="hero">
        <Column center fillWidth gap="l" style={{ marginBottom: 300 }}>
          <RevealFx>
          <Text variant="display-strong-xl" wrap="balance" marginTop="160" marginRight="160" marginLeft="160" align="center" >
            Orchestrating the Future of Robotic Fleets.
          </Text>
          </RevealFx>

          {/* Subheader description text */}
          <RevealFx delay={0.3}>
          <Text variant="heading-strong-xl" wrap="balance" marginRight="160" marginLeft="160" align="center" onBackground="neutral-medium">
            We are building a secure protocol to allow autonomous vehicles, drones, and robots to safely coordinate decisions in real-time, solving critical labor shortages and fragmentation.
          </Text>
          </RevealFx>

          {/* Call to Action Button - "Learn More" {or} "See Demo"*/}
          <RevealFx center delay={0.6}>
          <Button
            size="l"
            id="arrow-button-1" arrowIcon
            style={{ fontWeight: 700, fontSize: 22, borderRadius: 32, padding: "20px 48px" }}
            onClick={() => handleNavClick("demo")}
          // suffixIcon="chevronRight"        
          >
            See the Demo
          </Button>
          </RevealFx>
        </Column>
      </section>
      
      {/* The Problem Section */}
      <section ref={sectionRefs.problem} id="problem" style={{ marginBottom: 80}}>
        <Column center fillWidth gap="l" style={{ marginBottom: 300 }}>
          <Text variant="display-strong-m">
            The Problem
          </Text>

          <Text variant="heading-strong-l" wrap="balance" marginRight="160" marginLeft="160" align="center" onBackground="neutral-medium">
            Autonomous systems don’t talk to each other, leading to massive inefficiencies and security risks.
          </Text>

          {/* The Three Problems */}
          <Row fillWidth gap="16" paddingX="160">
            <TiltFx aspectRatio={6 / 4} radius="xl">
              <Card center radius="l-4" direction="column" border="neutral-alpha-medium" padding="s">
                <Column gap="24" align="center">
                  <Flex background="brand-medium"
                    style={{
                      background: "brand-medium", // Use var() or a Once UI token
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "auto", // for horizontal center in case
                    }}
                  >
                    <Text variant="body-strong-m" onBackground="brand-strong">1</Text>
                  </Flex>

                  <Text align="center" variant="body-default-m">Vehicles only see with their own sensors, leading to congestion and inefficiency.</Text>
                </Column>
              </Card>
            </TiltFx>

            <TiltFx aspectRatio={6 / 4} radius="xl">
              <Card center radius="l-4" direction="column" border="neutral-alpha-medium" padding="s">
                <Column gap="24" align="center">
                  <Flex background="brand-medium"
                    style={{
                      background: "brand-medium", // Use var() or a Once UI token
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "auto", // for horizontal center in case
                    }}
                  >
                    <Text variant="body-strong-m" onBackground="brand-strong">2</Text>
                  </Flex>

                  <Text align="center" variant="body-default-m">Fleets waste billions due to a critical lack of coordination and communication.</Text>
                </Column>
              </Card>
            </TiltFx>

            <TiltFx aspectRatio={6 / 4} radius="xl">
              <Card center radius="l-4" direction="column" border="neutral-alpha-medium" padding="s">
                <Column gap="24" align="center">
                  <Flex background="brand-medium"
                    style={{
                      background: "brand-medium", // Use var() or a Once UI token
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "auto", // for horizontal center in case
                    }}
                  >
                    <Text variant="body-strong-m" onBackground="brand-strong">3</Text>
                  </Flex>

                  <Text align="center" variant="body-default-m">Safety is at risk without a universal, secure communication standard.</Text>
                </Column>
              </Card>
            </TiltFx>
          </Row>
        </Column>
      </section>

      {/* The Solution Section */}
      <section ref={sectionRefs.solution} id="solution" style={{ marginBottom: 80 }}>
        <Column center fillWidth gap="l" style={{ marginBottom: 300 }}>
          <Text
            variant="display-strong-m"
            style={{ marginBottom: 24 }}
          >
            Echelon Protocol
          </Text>

          <Text variant="heading-strong-l" wrap="balance" marginRight="160" marginLeft="160" marginBottom="80" align="center" onBackground="neutral-medium">
            A universal protocol for secure, verifiable, machine-to-machine coordination for intellitegent decision making.
          </Text>
        </Column>
      </section>

      {/* The Demo Section */}
      <section ref={sectionRefs.demo} id="demo">
        <Column align="center" gap="l" style={{ margin: "0 auto 48px auto", maxWidth: 900 }}>
          <Heading variant="display-strong-xl" style={{ marginBottom: 24 }}>What happens when machines talk.</Heading>          

          {/* <Text>Delivery Objectives Demo:</Text> */}
          {/* <New_Demo /> */}
          {/* <BlockedRoadLab_Claude /> */}
          <Blocked_Road_lab />
          

          <Text variant="heading-default-m" style={{ textAlign: "center" }}>
            Our simulation shows the difference: when agents coordinate, congestion disappears and collisions are avoided.
          </Text>
        </Column>
      </section>
    </Column>
  );
}
