package software.purpledragon.scalafmtexample

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ScalafmtExampleSpec extends AnyFlatSpec with Matchers {
  val scalafmtExample = new ScalafmtExample()

  "greet" should "greet bob" in {
    scalafmtExample.greet("bob") shouldBe "hello, bob"
  }

  it should "also greet fred" in {
    scalafmtExample.greet("fred") shouldBe      "hello, fred"
  }
}
