{/* <Media
        src="https://drive.google.com/file/d/14frBYetG1s9125cTZf8oxlYZ8Jpm50GG/view?usp=drive_link"
        alt="Preview"
        radius="xl"
        border="neutral-alpha-medium"
      /> */}
    // </Column>

    // <Column fillWidth>
 


    //   {/* Navigation Bar */}
      // <Row
      //   as="nav"
      //   fillWidth
      //   align="center"
      //   style={{ justifyContent: "space-between" }}
      //   paddingY="m"
      //   paddingX="l"
      // >
    //     {/* <Row align="center" gap="s"> */}

    //     <Heading as="span" variant="display-strong-s" style={{ fontSize: 16, margin: 5 }}>Building the Future</Heading>
    //     {/* </Row> */}

        // <Row gap="l" as="ul" style={{ listStyle: "none" }}>
        //   {sections.map((s) => (
        //     <li key={s.id}>
        //       <Button
        //         variant="secondary"
        //         style={{ fontWeight: 600, fontSize: 16, borderRadius: 24, transition: "color 0.2s, background 0.2s", background: "transparent" }}
        //         onClick={() => handleNavClick(s.id)}
        //       >
        //         {s.label}
        //       </Button>
        //     </li>
        //   ))}
        // </Row>
    //   </Row>
    //   {/* Spacer for fixed nav */}
    //   <div style={{ height: 80 }} />

    //   {/* Hero Section */}
    //   <section ref={sectionRefs.hero} id="hero">
    //     <Column
    //       fillWidth
    //       align="center"
    //       gap="l"
    //       style={{
    //         minHeight: "80vh",
    //         margin: "0 auto 48px auto",
    //         padding: "64px 16px 64px 16px",
    //         maxWidth: 1100,
    //         textAlign: "center",
    //       }}
    //     >
    //       <Heading variant="display-strong-xl" style={{ fontSize: 48, letterSpacing: 1 }}>
    //         Helix Protocol
    //       </Heading>
    //       <Text variant="heading-default-l" style={{ fontSize: 24, marginBottom: 32 }}>
    //         We build the protocol that allows vehicles, drones, and robots to safely coordinate decisions in real time.
    //       </Text>

    //       <Button
    //         size="l"
    //         style={{ fontWeight: 700, fontSize: 22, borderRadius: 32, padding: "20px 48px" }}
    //         onClick={() => handleNavClick("demo")}
    //       >
    //         See the Demo
    //       </Button>
    //     </Column>
    //   </section>

    //   {/* Problem Section */}
    //   <section ref={sectionRefs.problem} id="problem">
    //     <Column align="center" gap="l" style={{ margin: "0 auto 48px auto", maxWidth: 900 }}>
    //       <Heading variant="display-strong-xl" style={{ marginBottom: 24 }}>Autonomous systems don’t talk to each other.</Heading>
    //       <Card style={{ padding: 32 }}>
    //         <Column gap="m">
    //           <Row gap="m" align="center">
    //             <Badge>1</Badge>
    //             <Text variant="heading-default-m">Vehicles only see with their own sensors → congestion + inefficiency.</Text>
    //           </Row>
    //           <Row gap="m" align="center">
    //             <Badge>2</Badge>
    //             <Text variant="heading-default-m">Fleets waste billions due to lack of coordination.</Text>
    //           </Row>
    //           <Row gap="m" align="center">
    //             <Badge>3</Badge>
    //             <Text variant="heading-default-m">Safety is at risk without a universal communication standard.</Text>
    //           </Row>
    //         </Column>
    //       </Card>
    //     </Column>
    //   </section>

    //   {/* Solution Section */}
    //   <section ref={sectionRefs.solution} id="solution">
    //     <Column align="center" gap="l" style={{ margin: "0 auto 48px auto", maxWidth: 900 }}>
    //       <Heading variant="display-strong-xl" style={{ marginBottom: 24 }}>A universal protocol for machine-to-machine coordination.</Heading>
    //       <Card style={{ padding: 32 }}>
    //         <Column gap="m">
    //           <Text variant="heading-default-m">Shared dictionary-based schema for vehicles + robots.</Text>
    //           <Text variant="heading-default-m">Secure, verifiable messages prevent cyberattacks.</Text>
    //           <Text variant="heading-default-m">Built on top of proven V2X + 5G tech (not reinventing the wheel).</Text>
    //         </Column>
    //         <Button
    //           size="m"
    //           style={{ fontWeight: 700, fontSize: 18, borderRadius: 24, marginTop: 24 }}
    //           onClick={() => window.location.href = 'mailto:team@helixprotocol.com'}
    //         >
    //           Learn More
    //         </Button>
    //       </Card>
    //     </Column>
    //   </section>

    //   {/* Demo Section */}
      

    //   {/* Market Section */}
    //   <section ref={sectionRefs.market} id="market">
    //     <Column align="center" gap="l" style={{ margin: "0 auto 48px auto", maxWidth: 900 }}>
    //       <Heading variant="display-strong-xl" style={{ marginBottom: 24 }}>We’re starting with logistics fleets.</Heading>
    //       <Card style={{ padding: 32 }}>
    //         <Text variant="heading-default-m">Huge ROI in delivery fleets (Amazon, FedEx, Walmart).</Text>
    //         <Text variant="heading-default-m">Expansion to AV makers, drones, smart infrastructure.</Text>
    //         <Row gap="l" align="center" style={{ marginTop: 24 }}>
    //           <Badge>Trucking</Badge>
    //           <Badge>Drones</Badge>
    //           <Badge>Mobility</Badge>
    //         </Row>
    //       </Card>
    //     </Column>
    //   </section>

      // {/* Team Section */}
      // <section ref={sectionRefs.team} id="team">
      //   <Column align="center" gap="l" style={{ margin: "0 auto 48px auto", maxWidth: 1100 }}>
      //     <Heading variant="display-strong-xl" style={{ marginBottom: 24 }}>We’re builders across AI, robotics, and business.</Heading>
      //     <Row gap="l" wrap={true} align="center">
      //       <Card style={{ minWidth: 220, textAlign: 'center', padding: 32 }}>
      //         <Avatar size="l" style={{ margin: '0 auto 12px auto' }}>JM</Avatar>
      //         <Heading as="h3" variant="heading-default-l">Jordan Marshall</Heading>
      //         <Text variant="heading-default-s">Simulation</Text>
      //       </Card>
      //       <Card style={{ minWidth: 220, textAlign: 'center', padding: 32 }}>
      //         <Avatar size="l" style={{ margin: '0 auto 12px auto' }}>KP</Avatar>
      //         <Heading as="h3" variant="heading-default-l">Kavin Phaibiani</Heading>
      //         <Text variant="heading-default-s">Web + Systems</Text>
      //       </Card>
      //       <Card style={{ minWidth: 220, textAlign: 'center', padding: 32 }}>
      //         <Avatar size="l" style={{ margin: '0 auto 12px auto' }}>RP</Avatar>
      //         <Heading as="h3" variant="heading-default-l">Rohan Patel</Heading>
      //         <Text variant="heading-default-s">Business + Strategy</Text>
      //       </Card>
      //       <Card style={{ minWidth: 220, textAlign: 'center', padding: 32 }}>
      //         <Avatar size="l" style={{ margin: '0 auto 12px auto' }}>AC</Avatar>
      //         <Heading as="h3" variant="heading-default-l">Alyssa Chan</Heading>
      //         <Text variant="heading-default-s">Simulation</Text>
      //       </Card>
      //       <Card style={{ minWidth: 220, textAlign: 'center', padding: 32 }}>
      //         <Avatar size="l" style={{ margin: '0 auto 12px auto' }}>GH</Avatar>
      //         <Heading as="h3" variant="heading-default-l">Gavin Huang</Heading>
      //         <Text variant="heading-default-s">Research + Ops</Text>
      //       </Card>
      //     </Row>
      //     <Button
      //       size="m"
      //       style={{ fontWeight: 700, fontSize: 18, borderRadius: 24, marginTop: 24 }}
      //       onClick={() => window.location.href = 'mailto:team@helixprotocol.com'}
      //     >
      //       Contact Us
      //     </Button>
      //   </Column>
      // </section>

      // {/* Footer */}
      // <footer ref={sectionRefs.footer} id="footer">
      //   <Column align="center" style={{ padding: 32, marginTop: 48 }}>
      //     <Text variant="heading-default-s">&copy; 2024 Helix Protocol. All rights reserved. | team@helixprotocol.com</Text>
      //   </Column>
      // </footer>
    // </Column>
//   );