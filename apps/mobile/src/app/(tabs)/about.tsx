import { Body, Card, DemoBanner, Heading, Muted, Screen } from "@/components/ui";

export default function AboutScreen() {
  return (
    <Screen>
      <DemoBanner />
      <Heading>MacKaye Fieldbook</Heading>
      <Muted>The trail guide that remembers your journey.</Muted>
      <Card>
        <Body>
          MacKaye Fieldbook is an independent, unofficial, offline-first field-guide and personal
          hiking-journal prototype inspired by the Benton MacKaye Trail.
        </Body>
      </Card>
      <Card>
        <Body>
          It is not affiliated with or endorsed by the Benton MacKaye Trail Association. It contains
          no association logos, guidebook text, photographs, proprietary maps, or real trail
          guidance.
        </Body>
      </Card>
      <Card>
        <Body>
          This app is not an emergency service, satellite communicator, or replacement for official
          alerts, current maps, navigation preparation, judgment, and appropriate safety equipment.
        </Body>
      </Card>
      <Muted>Placeholder logo: [ M / F ] · forest line · fieldbook page</Muted>
    </Screen>
  );
}
