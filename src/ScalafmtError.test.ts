import { ScalafmtError } from './ScalafmtError';

describe('ScalafmtError.parseErrors', () => {
  test('parses empty string', () => {
    const errors = ScalafmtError.parseErrors('', 'workdir');
    expect(errors).toHaveLength(0);
  });

  test('parses errors', () => {
    const input = `
--- workdir/Example.scala
+++ workdir/Example.scala-formatted
@@ -45,3 +45,3 @@
-    process( value )
+    process(value)
--- workdir/Example.scala
+++ workdir/Example.scala-formatted
@@ -85,5 +85,5 @@
-        .withHeader("foo", "5")
-        .withHeader("bar", "true")
-        .withHeader("baz", "other")
+      .withHeader("foo", "5")
+      .withHeader("bar", "true")
+      .withHeader("baz", "other")
`;

    const errors = ScalafmtError.parseErrors(input, 'workdir');

    expect(errors.map((error) => error.toString())).toEqual([
      '::error file=Example.scala,line=45,col=3::Incorrectly formatted line\n',
      '::error file=Example.scala,line=85,col=5::Incorrectly formatted lines\n',
    ]);
  });
});
