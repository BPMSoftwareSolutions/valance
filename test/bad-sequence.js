export const sequence = {
  // Missing name
  description: "Bad sequence",  // Too short description, no musical terms
  key: "X Minor",  // Invalid key
  tempo: -10,  // Invalid tempo
  timeSignature: "3/4",  // Non-standard time signature
  movements: [
    {
      // Missing movement name
      measures: [
        {
          beat: 1,
          // Missing event type
          // Missing title
          description: "Some beat",
          dependencies: [5]  // Invalid dependency - beat 5 doesn't exist
        },
        {
          beat: 3,  // Gap in beat numbering (should be 2)
          event: "bad",  // Invalid event type format
          title: "Bad Beat",
          // Missing description
          dependencies: []
        }
      ]
    },
    {
      name: "Empty Movement",
      measures: []  // Empty measures array
    }
  ]
};
